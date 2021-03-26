import { remote } from 'electron'
import Vue from 'vue'
import Vuetify from 'vuetify'

import ActionBar from '@/components/ActionBar.vue'
import store from '@/store'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)

jest.mock('electron', () => ({
  remote: {
    dialog: jest.fn()
  }

}))

jest.mock('@/store', () => ({
  state: {}
}))

remote.dialog = {
  showOpenDialog: jest.fn()
}

const localVue = createLocalVue()

describe('ActionBar.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    vuetify = new Vuetify()

    store.state = {
      tome: {
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
      },
      files: {
        tree: {
          daemon: {
            status: 'Grrreat!'
          }
        }
      },
      tome_file: '',
      tome_file_selected: '',
      tome_file_path: '',
      tome_file_data: '',
      tome_file_error: '',
      tome_app_config_path: '',
      tome_app_config_path_dir: ''
    }

    const waiting = 0
    const commit = false
    const push = false

    wrapper = mount(
      ActionBar,
      {
        localVue,
        vuetify,
        stubs: {
          StatusButton: true
        },
        propsData: {
          waiting,
          commit,
          push
        }
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('emits a commit event when the commit button is clicked', async () => {
    const event = jest.fn()

    wrapper.vm.$on('commit', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.find('[action-bar-commit]').trigger('click')

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('emits a push event when the push button is clicked', async () => {
    const event = jest.fn()

    wrapper.vm.$on('push', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.find('[action-bar-push]').trigger('click')

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('open dialog to select Tome folder when the bookshelf button is clicked', async () => {
    remote.dialog.showOpenDialog.mockReturnValue({
      canceled: true
    })

    expect(remote.dialog.showOpenDialog).toHaveBeenCalledTimes(0)

    await wrapper.find('[action-bar-bookshelf]').trigger('click')

    expect(remote.dialog.showOpenDialog).toHaveBeenCalledTimes(1)
  })

  it('emits a close event when the bookshelf button is clicked and no selection is made', async () => {
    const event = jest.fn()

    wrapper.vm.$on('close', event)

    remote.dialog.showOpenDialog.mockReturnValue({
      canceled: false,
      filePaths: []
    })

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.find('[action-bar-bookshelf]').trigger('click')

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('emits an open event when the bookshelf button is clicked and a selection is made', async () => {
    const event = jest.fn()

    wrapper.vm.$on('open', event)

    remote.dialog.showOpenDialog.mockReturnValue({
      canceled: false,
      filePaths: [
        '/path/to/file'
      ]
    })

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.find('[action-bar-bookshelf]').trigger('click')

    expect(event).toHaveBeenCalledTimes(1)
  })
})
