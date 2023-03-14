import { assemble } from '?/helpers'
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import store from '@/store'
import SplitPane from 'vue-splitpane'
import EditorInterface from '@/components/EditorInterface.vue'

jest.mock('@/store', () => ({
  state: Vue.observable({}),
  dispatch: jest.fn()
}))

jest.mock('lodash', () => ({
  debounce: (callback) => {
    callback.cancel = jest.fn()
    callback.flush = jest.fn()
    return callback
  },
  delay: (callback) => callback()
}))

jest.mock('mark.js', () => {
  return function () {
    return {
      unmark: jest.fn((options) => options.done(true)),
      markRegExp: jest.fn((regex, options) => options.done(3))
    }
  }
})

// jest.mock('mark.js', () => jest.fn().mockImplementation(() => {
//   return {
//     unmark: jest.fn((options) => options.done(true)),
//     markRegExp: jest.fn((regex, options) => options.done(3))
//   }
// }))

Vue.component('SplitPane', SplitPane)

function GenerateElementList (array) {
  return array.map(() => ({
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    },
    scrollIntoView: jest.fn()
  }))
}

const markjs_results_with_parents = GenerateElementList(['one-parent', 'one', 'two-parent', 'two', 'three-parent', 'three'])
const markjs_results = GenerateElementList(['one', 'two', 'three'])

describe('components/EditorInterface', () => {
  let vuetify
  let codemirror_cursor
  let codemirror

  beforeEach(() => {
    document.getSelection = jest.fn(() => ({ toString: () => '' }) as unknown as Selection)

    const settable_store = store as { state: any }
    settable_store.state = Vue.observable({
      files: {
        active: '/README.md',
        error: undefined,
        tree: undefined,
        ghost: undefined,
        editing: false,
        watcher: undefined,
        directory: {
          '/README.md': {
            path: '/README.md',
            name: 'README.md',
            relative: 'README.md',
            extension: '.md',
            image: false,
            directory: false,
            expanded: false,
            readonly: false,
            document: {
              content: '# README\n'
            }
          },
          '/document.md': {
            path: '/document.md',
            name: 'document.md',
            relative: 'document.md',
            extension: '.md',
            image: false,
            directory: false,
            expanded: false,
            readonly: false,
            document: {
              content: '# Document Data\n'
            }
          }
        }
      },
      search: {
        query: '',
        results: [],
        navigation: {
          target: 1,
          total: 0
        }
      },
      configuration: {
        dark_mode: false
      },
      system: {
        edit: false
      }
    })

    vuetify = new Vuetify()



    codemirror_cursor = {
      findNext: jest.fn(() => false),
      findPrevious: jest.fn(),
      from: jest.fn(() => 1),
      to: jest.fn(() => 100)
    }

    codemirror = {
      addOverlay: jest.fn(),
      removeOverlay: jest.fn(),
      refresh: jest.fn(),
      getSearchCursor: jest.fn(() => codemirror_cursor),
      getSelection: jest.fn(() => 'selected text'),
      setSelection: jest.fn(),
      scrollIntoView: jest.fn(),
      replaceSelection: jest.fn(),
      setOption: jest.fn(),
      isClean: jest.fn(() => false),
      save: jest.fn(),
      doc: {
        getValue: jest.fn(() => 'Value'),
        eachLine: jest.fn(),
        setValue: jest.fn()
      }
    }
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const factory = assemble(EditorInterface, {
    edit: false,
    commit: false,
    push: false
  }).context(() => (
    {
      vuetify,
      stubs: {
        ActionView: true,
        CommitView: true,
        EmptyPane: true,
        PushView: true,
        Explorer: true,
        codemirror: {
          template: '<div />',
          data: () => ({ codemirror })
        }
      }
    }
  )).hook(({ generated: { vue }}) => {
    vue.component('SplitPane', SplitPane)
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should dispatch files/debounce_save with path and content when save is called with path', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface

    const path = './file_path'
    await local.save(path)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'files/debounce_save')

    expect(action).toBeDefined()
    expect(data).toBeDefined()
    // expect(data.path).toEqual(path)
    // expect(data.content).toBeDefined()
  })

  it('should redirect to save with active path when input is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface
    local.save = jest.fn()

    await local.input()

    expect(local.save).toHaveBeenCalledTimes(1)
  })

  it('should render current content using marked', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface
    await expect(local.$nextTick()).resolves.toBeDefined()

    store.state.files.directory['/document.md'].document.content = '# Mock'
    store.state.files.active = '/document.md'

    await new Promise(resolve => setTimeout(resolve))

    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.rendered).toEqual('<h1 id="mock">Mock</h1>\n')
  })

  it('should abort search highlight update if no editor is visible', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface
    await expect(local.$nextTick()).resolves.toBeDefined()

    store.state.files.directory['/document.md'].document.content = ''

    expect(local.overlay).toBeUndefined()

    store.state.search.query = 'mock'
    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.overlay).toBeUndefined()
  })

  it('should update search highlight when the search query changes in render mode', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface
    await expect(local.$nextTick()).resolves.toBeDefined()

    store.state.files.directory['/document.md'].document.content = '# Mock'
    store.state.files.active = '/document.md'

    store.state.search.query = 'first'

    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.query).toEqual('first')
    expect(local.rendered).toEqual('<h1 id="mock">Mock</h1>\n')

    local.$refs.rendered.querySelectorAll = jest.fn((test) => {
      switch (test) {
        case 'mark > mark': return markjs_results_with_parents
        case 'mark': return markjs_results
      }
    })

    expect(local.mode.read.results.length).toBe(0)

    store.state.search.query = 'second'

    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.mode.read.results.length).not.toBeUndefined()
    expect(local.mode.read.results.length).not.toBe(0)
  })

  it('should trigger search when the edit attribute changes', async () => {
    store.state.system.edit = false

    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface
    local.search = jest.fn()
    expect(local.search).toHaveBeenCalledTimes(0)

    store.state.system.edit = true
    await local.$nextTick()

    expect(local.search).toHaveBeenCalledTimes(1)
  })

  it('should trigger navigation when the target attribute changes', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface
    await expect(local.$nextTick()).resolves.toBeDefined()

    store.state.search.navigation.target = 1

    await expect(local.$nextTick()).resolves.toBeDefined()

    local.navigate = jest.fn()

    store.state.search.navigation.target = 2
    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.navigate).toHaveBeenCalledTimes(1)
  })

  it('should update search highlight when the search query changes in edit mode', async () => {
    store.state.system.edit = true

    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface
    await expect(local.$nextTick()).resolves.toBeDefined()

    store.state.files.active = '/document.md'
    store.state.files.directory['/document.md'].document.content = '# Mock'
    store.state.search.query = 'first'

    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.query).toEqual('first')

    codemirror.addOverlay.mockClear()
    codemirror.removeOverlay.mockClear()
    codemirror.setSelection.mockClear()
    codemirror.scrollIntoView.mockClear()

    store.state.search.query = 'second'
    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(codemirror.removeOverlay).toHaveBeenCalledTimes(1)
    expect(codemirror.addOverlay).toHaveBeenCalledTimes(1)

    expect(codemirror.setSelection).toHaveBeenCalled()
    expect(codemirror.setSelection.mock.calls[0][0]).toBe(1)
    expect(codemirror.setSelection.mock.calls[0][1]).toBe(100)

    expect(codemirror.scrollIntoView).toHaveBeenCalled()
    expect(codemirror.scrollIntoView.mock.calls[0][0]).toEqual({ from: 1, to: 100 })
  })

  it('should align search selection with target selection when higher then target and navigate triggers in edit mode', async () => {
    store.state.system.edit = true
    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface
    await expect(local.$nextTick()).resolves.toBeDefined()

    store.state.files.directory['/document.md'].document.content = '# Mock'
    store.state.files.active = '/document.md'

    await expect(local.$nextTick()).resolves.toBeDefined()

    codemirror_cursor.findNext.mockImplementationOnce(() => true)
    codemirror_cursor.findNext.mockImplementationOnce(() => true)
    codemirror_cursor.findNext.mockImplementationOnce(() => true)

    store.state.search.query = 'mock'

    wrapper.setData({ mode: { write: { position: 4 } } })
    expect(local.mode.write.position).toBe(4)

    store.state.search.navigation.target = 2

    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.mode.write.position).toBe(2)
  })

  it('should set a functional CodeMirror mode object to overlay when search query changes in edit mode', async () => {
    store.state.system.edit = true
    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface
    await expect(local.$nextTick()).resolves.toBeDefined()

    store.state.files.active = '/document.md'
    store.state.files.directory['/document.md'].document.content = '# Mock'
    store.state.search.query = 'mock'

    await expect(local.$nextTick()).resolves.toBeDefined()

    expect(local.overlay).toBeDefined()
    expect(local.overlay.token).toBeDefined()

    const token_front = { pos: 0, string: 'mock match front', skipToEnd: jest.fn() }
    local.overlay.token(token_front)
    expect(token_front.skipToEnd).toHaveBeenCalledTimes(0)

    const token_middle = { pos: 0, string: 'match mock middle', skipToEnd: jest.fn() }
    local.overlay.token(token_middle)
    expect(token_middle.skipToEnd).toHaveBeenCalledTimes(0)

    const token_end = { pos: 0, string: 'match end mock', skipToEnd: jest.fn() }
    local.overlay.token(token_end)
    expect(token_end.skipToEnd).toHaveBeenCalledTimes(0)

    const token_none = { pos: 0, string: 'match none', skipToEnd: jest.fn() }
    local.overlay.token(token_none)
    expect(token_none.skipToEnd).toHaveBeenCalledTimes(1)
  })

  it('should dispatch clipboard/text with codemirror data when cut is called in edit mode', async () => {
    store.state.system.edit = true
    store.state.files.active = '/document.md'

    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface
    await local.context.find(item => item.title === 'Cut').action()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'clipboard/text')

    expect(action).toBeDefined()
    expect(data).toBeDefined()
  })

  it('should dispatch clipboard/text with codemirror data when copy is called in edit mode', async () => {
    store.state.system.edit = true
    store.state.files.active = '/document.md'

    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface
    await local.context.find(item => item.title === 'Copy').action()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'clipboard/text')

    expect(action).toBeDefined()
    expect(data).toBeDefined()
  })

  it('should dispatch clipboard/text with codemirror data when copy is called in read mode', async () => {
    store.state.system.edit = false
    store.state.files.active = '/document.md'

    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface
    await local.context.find(item => item.title === 'Copy').action()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'clipboard/text')

    expect(action).toBeDefined()
    expect(data).toBeDefined()
  })

  it('should paste clipboard into codemirror when paste is called in edit mode', async () => {
    store.state.system.edit = true
    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface

    store.state.files.active = '/document.md'

    await expect(local.$nextTick()).resolves.toBeDefined()

    await local.context.find(item => item.title === 'Paste').action()

    expect(local.$refs.editor.codemirror.replaceSelection).toHaveBeenCalledTimes(1)
  })

  it('should disable cut when in read mode', async () => {
    const wrapper = factory.wrap({})
    const local = wrapper.vm as EditorInterface
    await expect(local.$nextTick()).resolves.toBeDefined()

    let active
    for (const item of local.context) {
      if (item.title === 'Cut') {
        active = item.active
      }
    }

    expect(active()).toBeFalsy()
  })

  it('should disable paste when in read mode', async () => {
    const wrapper = factory.wrap({})
    const local = wrapper.vm as EditorInterface
    await expect(local.$nextTick()).resolves.toBeDefined()

    let active
    for (const item of local.context) {
      if (item.title === 'Paste') {
        active = item.active
      }
    }

    expect(active()).toBeFalsy()
  })

  it('should enable cut when in edit mode', async () => {
    store.state.system.edit = true
    store.state.files.active = '/document.md'

    const wrapper = factory.wrap()
    const local = wrapper.vm as EditorInterface

    await expect(local.$nextTick()).resolves.toBeDefined()

    let active
    for (const item of local.context) {
      if (item.title === 'Cut') {
        active = item.active
      }
    }

    expect(active()).toBeTruthy()
  })

  it('should enable paste when in edit mode', async () => {
    store.state.system.edit = true
    store.state.files.active = '/document.md'

    const wrapper = factory.wrap({ edit: true })
    const local = wrapper.vm as EditorInterface

    await expect(local.$nextTick()).resolves.toBeDefined()

    let active
    for (const item of local.context) {
      if (item.title === 'Paste') {
        active = item.active
      }
    }

    expect(active()).toBeTruthy()
  })
})
