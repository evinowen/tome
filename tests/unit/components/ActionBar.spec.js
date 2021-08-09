import { remote } from 'electron'
import Vue from 'vue'
import Vuetify from 'vuetify'

import ActionBar from '@/components/ActionBar.vue'
import store from '@/store'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)

jest.mock('electron', () => ({
  remote: {
    BrowserWindow: jest.fn(),
    dialog: jest.fn()
  }
}))

remote.BrowserWindow = {
  getFocusedWindow: jest.fn(() => ({}))
}

let remote_dialog_result

remote.dialog = {
  showOpenDialog: jest.fn(() => remote_dialog_result)
}

jest.mock('@/store', () => ({
  state: {},
  dispatch: jest.fn()
}))

const localVue = createLocalVue()

describe('ActionBar.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    remote_dialog_result = {
      canceled: false,
      filePaths: ['./file_path']
    }

    vuetify = new Vuetify()

    store.state = {
      tome: {
        path: './tome_path',
        name: 'Name',
        branch: {
          name: 'master',
          error: null
        },
        status: {
          available: { new: 0, renamed: 0, modified: 0, deleted: 0 },
          staged: { new: 0, renamed: 0, modified: 0, deleted: 0 }
        },
        metadata: {
          readme: null,
          license: null,
          authors: null,
          contributors: null
        }
      },
      files: {
        tree: {
          daemon: {
            status: 'Grrreat!'
          }
        }
      }
    }

    const branch = false
    const commit = false
    const push = false

    wrapper = mount(
      ActionBar,
      {
        localVue,
        vuetify,
        stubs: {
          LibraryButton: true,
          StatusButton: true
        },
        propsData: {
          branch,
          commit,
          push
        }
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should emit "open" event with path when open called with path', async () => {
    const event = jest.fn()

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)

    const path = './file_path'
    await wrapper.vm.open(path)

    expect(event).toHaveBeenCalledTimes(1)
    expect(event.mock.calls[0][0]).toBe(path)
  })

  it('should pass dialog selected file to "open" event with path when open called without a path', async () => {
    const event = jest.fn()

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    const path = remote_dialog_result.filePaths[0]

    expect(event).toHaveBeenCalledTimes(1)
    expect(event.mock.calls[0][0]).toBe(path)
  })

  it('should not emit an "open" event when open called without a path and dialog is canceled', async () => {
    remote_dialog_result.canceled = true

    const event = jest.fn()

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    expect(event).toHaveBeenCalledTimes(0)
  })

  it('should not emit an "open" event when open called without a path and file is not included', async () => {
    remote_dialog_result.filePaths = []

    const event = jest.fn()

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    expect(event).toHaveBeenCalledTimes(0)
  })

  it('should return value of diabled when true is passed into disabled_unless', async () => {
    expect(wrapper.vm.disabled).toEqual(false)

    const disabled = wrapper.vm.disabled_unless(true)

    expect(disabled).toEqual(false)
  })

  it('should return OR of toggle values when false is passed into disabled_unless', async () => {
    wrapper.setProps({ branch: true })

    expect(wrapper.vm.disabled).toEqual(false)
    expect(wrapper.vm.branch).toEqual(true)
    expect(wrapper.vm.commit).toEqual(false)
    expect(wrapper.vm.push).toEqual(false)

    const disabled = wrapper.vm.disabled_unless(false)

    expect(disabled).toEqual(true)
  })

  it('should dispatch file select with path when open_file called with path', async () => {
    const path = './file_path'
    await wrapper.vm.open_file(path)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toEqual('files/select')
    expect(store.dispatch.mock.calls[0][1]).toEqual({ path })
  })
})
