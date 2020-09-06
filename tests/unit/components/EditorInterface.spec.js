import { assemble } from '@/../tests/helpers'
import builders from '@/../tests/builders'

import Vuex from 'vuex'
import Vuetify from 'vuetify'

import SplitPane from 'vue-splitpane'
import EditorInterface from '@/components/EditorInterface.vue'

// Vue.use(Vuetify)
// Vue.component('split-pane', SplitPane)

describe('EditorInterface.vue', () => {
  let vuetify
  let store

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
        Codemirror: true
      }
    }
  )).hook(({ context, localVue }) => {
    localVue.use(Vuetify)
    localVue.component('split-pane', SplitPane)
    vuetify = new Vuetify()
    context.vuetify = vuetify

    localVue.use(Vuex)
    store = builders.store()
    context.store = store
  })

  it('should call store file save action for item path provided by save event', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    store.dispatch = jest.fn()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.save({ path: '/project/third' })

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/save')
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
    await store.dispatch('search/mock', { query: '' })

    const mark = {
      unmark: jest.fn(),
      markRegExp: jest.fn()
    }

    wrapper.setData({ mark })

    expect(wrapper.vm.query).toEqual('')
    expect(wrapper.vm.rendered).toEqual('<h1 id="mock">Mock</h1>\n')

    await store.dispatch('search/mock', { query: 'mock' })
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(mark.unmark).toHaveBeenCalledTimes(1)
    expect(mark.markRegExp).toHaveBeenCalledTimes(1)
  })

  it('should update search highlight when the search query changes in edit mode', async () => {
    const codemirror = {
      addOverlay: jest.fn(),
      removeOverlay: jest.fn()
    }

    const wrapper = factory.wrap({ edit: true })
    wrapper.vm.$refs.editor.codemirror = codemirror

    await store.dispatch('files/mock', { content: '# Mock' })
    await store.dispatch('search/mock', { query: '' })

    expect(wrapper.vm.query).toEqual('')

    codemirror.addOverlay.mockClear()
    codemirror.removeOverlay.mockClear()

    await store.dispatch('search/mock', { query: 'mock' })

    expect(codemirror.removeOverlay).toHaveBeenCalledTimes(1)
    expect(codemirror.addOverlay).toHaveBeenCalledTimes(1)
  })

  it('should set a functional CodeMirror mode object to overlay when search query changes in edit mode', async () => {
    const codemirror = {
      addOverlay: jest.fn(),
      removeOverlay: jest.fn()
    }

    const wrapper = factory.wrap({ edit: true })
    wrapper.vm.$refs.editor.codemirror = codemirror

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
})
