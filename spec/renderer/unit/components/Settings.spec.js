import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import Settings from '@/components/Settings'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

// eslint-disable-next-line unicorn/consistent-function-scoping
jest.mock('lodash/debounce', () => (callback) => {
  callback.cancel = jest.fn()
  callback.flush = jest.fn()
  return callback
})

describe('components/Settings', () => {
  let vuetify

  const factory = assemble(Settings)
    .context(() => ({
      vuetify,
      stubs: {
        KeyfileInput: true
      }
    }))

  beforeEach(() => {
    vuetify = new Vuetify()

    store.state = {
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
      },
      system: {
        version: '0.0.0',
        process: null
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should dispatch system/settings with false when close is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.close()

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/settings')

    expect(action).toBeDefined()
    expect(data).toBe(false)
  })

  it('should dispatch configuration/generate with passphrase when generate_key is called with passphrase', async () => {
    const passphrase = 'password'
    const wrapper = factory.wrap()

    await wrapper.vm.generate_key(passphrase)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'configuration/generate')

    expect(action).toBeDefined()
    expect(data).toBe(passphrase)
  })

  it('should dispatch configuration/write when save is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.save()

    const [action = null] = store.dispatch.mock.calls.find(([action]) => action === 'configuration/write')

    expect(action).toBeDefined()
  })
})
