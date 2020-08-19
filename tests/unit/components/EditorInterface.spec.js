import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'

import store from '@/store'
import SplitPane from 'vue-splitpane'
import EditorInterface from '@/components/EditorInterface.vue'

Vue.use(Vuetify)
Vue.component('split-pane', SplitPane)

jest.mock('@/store', () => ({
  state: {
    tome: {
      name: 'project',
      path: '/project'
    },
    configuration: {
      format_titles: false
    },
    files: {
      active: null,
      content: null,
      error: null,
      tree: {}
    },
    search: {
      query: null
    }
  },
  dispatch: jest.fn()
}))

describe('EditorInterface.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const cm = {
    codemirror: {
      addOverlay: jest.fn(),
      removeOverlay: jest.fn()
    }
  }

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
        EmptyView: true,
        PushView: true,
        Explorer: true,
        Codemirror: true
      }
    }
  ))

  it('should call store file save action for item path provided by save event', async () => {
    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.save({ path: '/project/third' })

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('files/save')
  })

  it('should render current content using marked', async () => {
    store.state.files.content = '# Mock'

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.rendered).toEqual('<h1 id="mock">Mock</h1>\n')
  })

  it('should not render the editor if there is no content', async () => {
    store.state.files.content = ''

    const wrapper = factory.wrap()

    expect(wrapper.vm.$refs.editor).toBeUndefined()
  })

  it('should abort search highligh update is no editor is visible', async () => {
    store.state.files.content = ''

    const wrapper = factory.wrap()

    expect(wrapper.vm.overlay).toBeNull()

    store.state.search.query = 'mock'
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    // Vue Test Utils does not have a mechanism for triggering updates to watchers of computed properities
    wrapper.vm.$options.watch.search.call(wrapper.vm, store.state.search.query)

    expect(wrapper.vm.overlay).toBeNull()
  })

  it('should update search highlight when the search query changes', async () => {
    store.state.files.content = '# Mock'
    store.state.search.query = ''

    const wrapper = factory.wrap()
    const codemirror = {
      addOverlay: jest.fn(),
      removeOverlay: jest.fn()
    }

    const overlay = {}

    wrapper.vm.$refs.editor.codemirror = codemirror
    wrapper.setData({ overlay })

    expect(wrapper.vm.search).toEqual('')
    expect(wrapper.vm.rendered).toEqual('<h1 id="mock">Mock</h1>\n')

    store.state.search.query = 'mock'
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    // Vue Test Utils does not have a mechanism for triggering updates to watchers of computed properities
    wrapper.vm.$options.watch.search.call(wrapper.vm, store.state.search.query)

    expect(codemirror.removeOverlay).toHaveBeenCalledTimes(1)
    expect(codemirror.removeOverlay.mock.calls[0][0]).toBe(overlay)

    wrapper.vm.overlay.token({ pos: 0, string: store.state.files.content, skipToEnd: jest.fn() })
  })

  it('should set a functional CodeMirror mode object to overlay when search query changes', async () => {
    store.state.files.content = '# Mock'
    store.state.search.query = ''

    const wrapper = factory.wrap()
    const codemirror = {
      addOverlay: jest.fn(),
      removeOverlay: jest.fn()
    }

    const overlay = {}

    wrapper.vm.$refs.editor.codemirror = codemirror
    wrapper.setData({ overlay })

    store.state.search.query = 'mock'
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    // Vue Test Utils does not have a mechanism for triggering updates to watchers of computed properities
    wrapper.vm.$options.watch.search.call(wrapper.vm, store.state.search.query)

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
