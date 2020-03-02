import { remote } from 'electron'
import Vue from 'vue'
import Vuetify from 'vuetify'

import SplitPane from 'vue-splitpane'

import { createLocalVue, mount } from '@vue/test-utils'
import EditorInterface from '@/components/EditorInterface.vue'

Vue.use(Vuetify)
Vue.component('split-pane', SplitPane)

jest.mock('electron', () => ({
  remote: {
    require: jest.fn()

  }

}))

const fs = {
  open: jest.fn(),
  close: jest.fn(),
  mkdir: jest.fn()
}

const path = {
  join: jest.fn(),
  relative: jest.fn(),
  isAbsolute: jest.fn()
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return fs
    case 'path': return path
  }
})

jest.mock('nodegit', () => ({}))

const localVue = createLocalVue()

describe('ExplorerNode.vue', () => {
  let vuetify
  let wrapper

  const tome = {
    path: '/pa/th/to/to/me',
    name: 'Name',

    branch: {
      name: 'master',
      error: null

    },

    status: {
      available: { new: 0, renamed: 0, modified: 0, deleted: 0 },
      staged: { new: 0, renamed: 0, modified: 0, deleted: 0 }

    }

  }

  function wrap (object) {
    wrapper = mount(
      EditorInterface,
      {
        localVue,
        vuetify,
        stubs: {
          EmptyView: true,
          ActionView: true,
          CommitView: true,
          PushView: true
        },
        propsData: {
          tome: tome,
          configuration: { },
          edit: false,
          commit: false,
          push: false,
          new_file: null,
          new_folder: null,
          open_folder: null,

          ...(object || {})

        }
      }

    )
  }

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render empty view if not editing and no file is loaded', async () => {
    wrap()

    expect(wrapper.find('[editor-interface-empty]').isVisible()).toBe(true)
  })
})
