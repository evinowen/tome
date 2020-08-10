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
    }
  },
  dispatch: jest.fn()
}))

describe('EditorInterface.vue', () => {
  let vuetify

  beforeEach(() => {
    store.state = {
      tome: {
        name: 'TestTome',
        path: '/abc/123/xyz/tmp'
      },
      files: {
        active: null,
        content: null,
        error: null,
        tree: {}
      }
    }

    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const factory = assemble(EditorInterface, {
    edit: false,
    commit: false,
    push: false
  })
    .context(() => (
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

  it('should render empty view if not editing and no file is loaded', async () => {
    store.state.tome.name = null
    store.state.tome.path = null

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.find({ ref: 'empty_unloaded' }).exists()).toBe(true)
  })

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
})
