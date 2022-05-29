import { remote } from 'electron'
import Vue from 'vue'
import Vuetify from 'vuetify'

import LibraryButton from '@/components/LibraryButton.vue'

import { createLocalVue, mount } from '@vue/test-utils'

const focused_window = {}

jest.mock('electron', () => ({
  remote: {
    BrowserWindow: jest.fn(),
    dialog: jest.fn(),
    require: jest.fn()
  }
}))

let dialog_result

const path = {
  basename: jest.fn()
}

remote.BrowserWindow = {
  getFocusedWindow: jest.fn(() => focused_window)
}

remote.dialog = {
  showOpenDialog: jest.fn(() => dialog_result)
}

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('LibraryButton.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    dialog_result = {
      canceled: false,
      filePaths: ['./test_tome']
    }

    vuetify = new Vuetify()

    const value = null
    const stored = null

    wrapper = mount(
      LibraryButton,
      {
        localVue,
        vuetify,
        propsData: {
          value,
          stored
        }
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should emit "open" event when file is successfully opened with open method', async () => {
    const event = jest.fn()

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should not emit "close" event when file is successfully opened with open method', async () => {
    const event = jest.fn()

    wrapper.vm.$on('close', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    expect(event).toHaveBeenCalledTimes(0)
  })

  it('should not emit "open" event when open method dialog box is canceled', async () => {
    dialog_result.canceled = true

    const event = jest.fn()

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    expect(event).toHaveBeenCalledTimes(0)
  })

  it('should not emit "open" event when open method dialog box returns no files', async () => {
    dialog_result.filePaths.length = 0

    const event = jest.fn()

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    expect(event).toHaveBeenCalledTimes(0)
  })

  it('should emit "close" event when open method dialog box returns no files', async () => {
    dialog_result.filePaths.length = 0

    const event = jest.fn()

    wrapper.vm.$on('close', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    expect(event).toHaveBeenCalledTimes(1)
  })
})
