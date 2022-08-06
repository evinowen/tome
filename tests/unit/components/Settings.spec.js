import Vue from 'vue'
import Vuetify from 'vuetify'

import Settings from '@/components/Settings.vue'
import store from '@/store'

import { createLocalVue, mount } from '@vue/test-utils'

jest.mock('lodash/debounce', () => (callback) => {
  callback.cancel = jest.fn()
  callback.flush = jest.fn()
  return callback
})

jest.mock('@/store', () => ({
  state: {
    configuration: {
      name: '',
      email: '',
      private_key: '',
      passphrase: '',
      format_titles: false,
      dark_mode: false,
      auto_push: false,
      default_remote: 'origin',
      light_primary: '',
      light_primary_enabled: false,
      light_secondary: '',
      light_secondary_enabled: false,
      light_accent: '',
      light_accent_enabled: false,
      light_error: '',
      light_error_enabled: false,
      light_info: '',
      light_info_enabled: false,
      light_warning: '',
      light_warning_enabled: false,
      light_success: '',
      light_success_enabled: false,
      dark_primary: '',
      dark_primary_enabled: false,
      dark_secondary: '',
      dark_secondary_enabled: false,
      dark_accent: '',
      dark_accent_enabled: false,
      dark_error: '',
      dark_error_enabled: false,
      dark_info: '',
      dark_info_enabled: false,
      dark_warning: '',
      dark_warning_enabled: false,
      dark_success: '',
      dark_success_enabled: false
    }
  },
  dispatch: jest.fn()
}))

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('Settings.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    vuetify = new Vuetify()

    wrapper = mount(
      Settings,
      {
        localVue,
        vuetify,
        stubs: {
          KeyfileInput: true
        }
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should mount and set prop and data defaults', async () => {
    expect(wrapper.vm.value).toEqual(false)
  })

  it('should assign value to configuration option on call to assign_value', async () => {
    expect(wrapper.vm.value).toEqual(false)

    const name = 'name'
    const value = 'value'

    await wrapper.vm.assign_value(name, value)

    expect(store.dispatch.mock.calls[0][0]).toEqual('configuration/update')
    expect(store.dispatch.mock.calls[0][1]).toEqual({ [name]: value })
  })

  it('should dispatch configuration write on call to save', async () => {
    await wrapper.vm.save()

    expect(store.dispatch.mock.calls[0][0]).toEqual('configuration/write')
  })
})
