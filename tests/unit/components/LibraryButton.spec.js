import Vue from 'vue'
import Vuetify from 'vuetify'

import LibraryButton from '@/components/LibraryButton.vue'

import { createLocalVue, mount } from '@vue/test-utils'

import builders from '@/../tests/builders'

Object.assign(window, builders.window())

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('LibraryButton.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    window._.reset_dialog()

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
    window._.trip_canceled_dialog()

    const event = jest.fn()

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    expect(event).toHaveBeenCalledTimes(0)
  })

  it('should not emit "open" event when open method dialog box returns no files', async () => {
    window._.trip_empty_dialog()

    const event = jest.fn()

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    expect(event).toHaveBeenCalledTimes(0)
  })

  it('should emit "close" event when open method dialog box returns no files', async () => {
    window._.trip_empty_dialog()

    const event = jest.fn()

    wrapper.vm.$on('close', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.open()

    expect(event).toHaveBeenCalledTimes(1)
  })
})
