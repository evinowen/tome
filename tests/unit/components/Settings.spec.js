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
      public_key: '',
      passphrase: '',
      format_titles: false,
      dark_mode: false
    }
  },
  dispatch: jest.fn()
}))

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('Settings.vue', () => {
  let vuetify
  let wrapper

  let file

  beforeEach(() => {
    vuetify = new Vuetify()

    file = {
      path: './file_path'
    }

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

  it('should assign file path as value to configuration option on call to assign_key', async () => {
    expect(wrapper.vm.value).toEqual(false)

    const name = 'name'
    const event = {
      target: {
        files: [file]
      }
    }

    await wrapper.vm.assign_key(name, event)

    expect(store.dispatch.mock.calls[0][0]).toEqual('configuration/update')
    expect(store.dispatch.mock.calls[0][1]).toEqual({ [name]: file.path })
  })

  it('should dispatch configuration write on call to save', async () => {
    await wrapper.vm.save()

    expect(store.dispatch.mock.calls[0][0]).toEqual('configuration/write')
  })
})
