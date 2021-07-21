import { assemble } from '@/../tests/helpers'
import builders from '@/../tests/builders'

import { clipboard } from 'electron'
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'

import SplitPane from 'vue-splitpane'
import EditorInterface from '@/components/EditorInterface.vue'
jest.mock('@/store', () => ({ }))

jest.useFakeTimers()

jest.mock('electron', () => ({
  clipboard: {
    readText: jest.fn(),
    writeText: jest.fn()
  }
}))

jest.mock('mark.js', () => {
  return function () {
    return {
      unmark: jest.fn((options) => options.done(true)),
      markRegExp: jest.fn((regex, options) => options.done(3))
    }
  }
})

Vue.use(Vuetify)
Vue.component('split-pane', SplitPane)

function GenerateElementList (array) {
  return array.map(item => ({
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    },
    scrollIntoView: jest.fn()
  }))
}

const markjs_results_with_parents = GenerateElementList(['one-parent', 'one', 'two-parent', 'two', 'three-parent', 'three'])
const markjs_results = GenerateElementList(['one', 'two', 'three'])

describe('EditorInterface.vue', () => {
  let vuetify
  let store

  const codemirror_cursor = {
    findNext: jest.fn(() => false),
    findPrevious: jest.fn(),
    from: jest.fn(() => 1),
    to: jest.fn(() => 100)
  }

  const codemirror = {
    addOverlay: jest.fn(),
    removeOverlay: jest.fn(),
    getSearchCursor: jest.fn(() => codemirror_cursor),
    getSelection: jest.fn(() => 'selected text'),
    setSelection: jest.fn(),
    scrollIntoView: jest.fn(),
    replaceSelection: jest.fn(),
    setOption: jest.fn(),
    isClean: jest.fn(() => false),
    save: jest.fn(),
    doc: {
      getValue: jest.fn(() => 'Value')
    }
  }

  beforeEach(async () => {
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const factory = assemble(EditorInterface, {
    edit: false,
    commit: false,
    push: false
  }).context(() => (
    {
      stubs: {
        ActionView: true,
        CommitView: true,
        EmptyView: true,
        PushView: true,
        Explorer: true,
        Codemirror: {
          template: '<div />',
          data: () => ({ codemirror })
        }
      }
    }
  )).hook(({ context, localVue }) => {
    localVue.use(Vuetify)
    localVue.use(Vuex)
    localVue.component('split-pane', SplitPane)

    vuetify = new Vuetify()
    context.vuetify = vuetify

    store = builders.store()
    context.store = store
  })

  it('should emit a save event when input method is called and changes have been made', async () => {
    const wrapper = factory.wrap()

    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const event = jest.fn()
    wrapper.vm.$on('save', event)

    store.dispatch = jest.fn()

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.input(codemirror)

    jest.runAllTimers()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should do nothing when input method is called and changes have not been made', async () => {
    codemirror.isClean.mockImplementation(() => true)

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const event = jest.fn()
    wrapper.vm.$on('save', event)

    store.dispatch = jest.fn()

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.input(codemirror)

    jest.runAllTimers()

    expect(event).toHaveBeenCalledTimes(0)
  })

  it('should update the interface to plain text when document is read only', async () => {
    codemirror.isClean.mockImplementation(() => true)

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    codemirror.setOption.mockClear()

    await store.dispatch('files/mock', { selected: { readonly: true }, active: '/project/path' })

    expect(codemirror.setOption).toHaveBeenCalledTimes(2)

    expect(codemirror.setOption.mock.calls[0][0]).toBe('readOnly')
    expect(codemirror.setOption.mock.calls[0][1]).toBe(true)

    expect(codemirror.setOption.mock.calls[1][0]).toBe('mode')
    expect(codemirror.setOption.mock.calls[1][1]).toBeNull()
  })

  it('should render current content using marked', async () => {
    const wrapper = factory.wrap()

    await store.dispatch('files/mock', { content: '# Mock' })

    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.rendered).toEqual('<h1 id="mock">Mock</h1>\n')
  })

  it('should abort search highlight update if no editor is visible', async () => {
    const wrapper = factory.wrap()

    await store.dispatch('files/mock', { content: '' })

    expect(wrapper.vm.overlay).toBeNull()

    store.dispatch('search/mock', { query: 'mock' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.overlay).toBeNull()
  })

  it('should update search highlight when the search query changes in render mode', async () => {
    const wrapper = factory.wrap()

    await store.dispatch('files/mock', { content: '# Mock' })
    await store.dispatch('search/mock', { query: 'first' })

    expect(wrapper.vm.query).toEqual('first')
    expect(wrapper.vm.rendered).toEqual('<h1 id="mock">Mock</h1>\n')

    wrapper.vm.$refs.rendered.querySelectorAll = jest.fn((test) => {
      switch (test) {
        case 'mark > mark': return markjs_results_with_parents
        case 'mark': return markjs_results
      }
    })

    expect(wrapper.vm.mode.read.results.length).toBe(0)

    await store.dispatch('search/mock', { query: 'second' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.mode.read.results.length).not.toBeNull()
    expect(wrapper.vm.mode.read.results.length).not.toBe(0)
  })

  it('should trigger search when the edit attribute changes', async () => {
    const wrapper = factory.wrap({ edit: false })

    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    wrapper.vm.search = jest.fn()

    await wrapper.setProps({ edit: true })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.search).toHaveBeenCalledTimes(1)
  })

  it('should trigger navigation when the target attribute changes', async () => {
    const wrapper = factory.wrap({})

    store.dispatch('search/mock', { navigation: { target: 1 } })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    wrapper.vm.navigate = jest.fn()

    store.dispatch('search/mock', { navigation: { target: 2 } })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.navigate).toHaveBeenCalledTimes(1)
  })

  it('should update search highlight when the search query changes in edit mode', async () => {
    const wrapper = factory.wrap({ edit: true })

    await store.dispatch('files/mock', { active: '/project/path' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    await store.dispatch('files/mock', { content: '# Mock' })
    await store.dispatch('search/mock', { query: 'first' })

    expect(wrapper.vm.query).toEqual('first')

    codemirror.addOverlay.mockClear()
    codemirror.removeOverlay.mockClear()
    codemirror.setSelection.mockClear()
    codemirror.scrollIntoView.mockClear()

    await store.dispatch('search/mock', { query: 'second' })

    expect(codemirror.removeOverlay).toHaveBeenCalledTimes(1)
    expect(codemirror.addOverlay).toHaveBeenCalledTimes(1)

    expect(codemirror.setSelection).toHaveBeenCalledTimes(1)
    expect(codemirror.setSelection.mock.calls[0][0]).toBe(1)
    expect(codemirror.setSelection.mock.calls[0][1]).toBe(100)

    expect(codemirror.scrollIntoView).toHaveBeenCalledTimes(1)
    expect(codemirror.scrollIntoView.mock.calls[0][0]).toEqual({ from: 1, to: 100 })
  })

  it('should align search selection with target selection when higher then target and navigate triggers in edit mode', async () => {
    const wrapper = factory.wrap({ edit: true })

    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    await store.dispatch('files/mock', { content: '# Mock' })
    await store.dispatch('files/mock', { active: '/project/path' })

    codemirror_cursor.findNext.mockImplementationOnce(() => true)
    codemirror_cursor.findNext.mockImplementationOnce(() => true)
    codemirror_cursor.findNext.mockImplementationOnce(() => true)

    await store.dispatch('search/mock', { query: 'mock' })

    wrapper.setData({ mode: { write: { position: 4 } } })

    await store.dispatch('search/mock', { __target: 'navigation', target: 2 })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.mode.write.position).toBe(2)
  })

  it('should set a functional CodeMirror mode object to overlay when search query changes in edit mode', async () => {
    const wrapper = factory.wrap({ edit: true })

    await store.dispatch('files/mock', { active: '/project/path' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    await store.dispatch('files/mock', { content: '# Mock' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    await store.dispatch('search/mock', { query: 'mock' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.overlay).toBeDefined()
    expect(wrapper.vm.overlay.token).toBeDefined()

    const token_front = { pos: 0, string: 'mock match front', skipToEnd: jest.fn() }
    wrapper.vm.overlay.token(token_front)
    expect(token_front.skipToEnd).toHaveBeenCalledTimes(0)

    const token_middle = { pos: 0, string: 'match mock middle', skipToEnd: jest.fn() }
    wrapper.vm.overlay.token(token_middle)
    expect(token_middle.skipToEnd).toHaveBeenCalledTimes(0)

    const token_end = { pos: 0, string: 'match end mock', skipToEnd: jest.fn() }
    wrapper.vm.overlay.token(token_end)
    expect(token_end.skipToEnd).toHaveBeenCalledTimes(0)

    const token_none = { pos: 0, string: 'match none', skipToEnd: jest.fn() }
    wrapper.vm.overlay.token(token_none)
    expect(token_none.skipToEnd).toHaveBeenCalledTimes(1)
  })

  it('should set clipboard with codemirror data when cut is called in edit mode', async () => {
    const wrapper = factory.wrap({ edit: true })
    await store.dispatch('files/mock', { active: '/project/path' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let action
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Cut') {
        action = item.action
      }
    })

    action()

    expect(wrapper.vm.$refs.editor.codemirror.getSelection).toHaveBeenCalledTimes(1)
    expect(wrapper.vm.$refs.editor.codemirror.replaceSelection).toHaveBeenCalledTimes(1)
    expect(clipboard.writeText).toHaveBeenCalledTimes(1)
  })

  it('should set clipboard with codemirror data when copy is called in edit mode', async () => {
    const wrapper = factory.wrap({ edit: true })
    await store.dispatch('files/mock', { active: '/project/path' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let action
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Copy') {
        action = item.action
      }
    })

    action()

    expect(wrapper.vm.$refs.editor.codemirror.getSelection).toHaveBeenCalledTimes(1)
    expect(clipboard.writeText).toHaveBeenCalledTimes(1)
  })

  it('should set clipboard with document data when copy is called in read mode', async () => {
    document.getSelection = jest.fn(() => 'selected text')

    const wrapper = factory.wrap({})
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    const event = jest.fn()
    wrapper.vm.$on('context', event)

    let action
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Copy') {
        action = item.action
      }
    })

    action()

    expect(document.getSelection).toHaveBeenCalledTimes(1)
    expect(clipboard.writeText).toHaveBeenCalledTimes(1)
  })

  it('should paste clipboard into codemirror when paste is called in edit mode', async () => {
    const wrapper = factory.wrap({ edit: true })
    await store.dispatch('files/mock', { active: '/project/path' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let action
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Paste') {
        action = item.action
      }
    })

    action()

    expect(wrapper.vm.$refs.editor.codemirror.replaceSelection).toHaveBeenCalledTimes(1)
  })

  it('should disable cut when in read mode', async () => {
    const wrapper = factory.wrap({})
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let active
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Cut') {
        active = item.active
      }
    })

    expect(active()).toBeFalsy()
  })

  it('should disable paste when in read mode', async () => {
    const wrapper = factory.wrap({})
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let active
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Paste') {
        active = item.active
      }
    })

    expect(active()).toBeFalsy()
  })

  it('should enable cut when in edit mode', async () => {
    const wrapper = factory.wrap({ edit: true })
    await store.dispatch('files/mock', { active: '/project/path' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let active
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Cut') {
        active = item.active
      }
    })

    expect(active()).toBeTruthy()
  })

  it('should enable paste when in edit mode', async () => {
    const wrapper = factory.wrap({ edit: true })
    await store.dispatch('files/mock', { active: '/project/path' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    let active
    wrapper.vm.context.forEach(item => {
      if (item.title === 'Paste') {
        active = item.active
      }
    })

    expect(active()).toBeTruthy()
  })
})
