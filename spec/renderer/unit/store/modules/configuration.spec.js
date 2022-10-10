import Vuex from 'vuex'
import vuetify from '@/vuetify'
import { createLocalVue } from '@vue/test-utils'
import configuration from '@/store/modules/configuration'
import { cloneDeep } from 'lodash'
import builders from '?/builders'

Object.assign(window, builders.window())

window._.set_content(JSON.stringify({
  name: 'Test User',
  email: 'testuser@example.com',
  private_key: 'id_rsa',
  passphrase: 'password',
  format_titles: false,
  dark_mode: true
}))

describe('store/modules/configuration', () => {
  let localVue
  let store

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    window._.reset_disk()

    store = new Vuex.Store(cloneDeep({
      modules: {
        configuration
      }
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    expect(store.state.configuration.name).toBe('')
    expect(store.state.configuration.email).toBe('')
    expect(store.state.configuration.private_key).toBe('')
    expect(store.state.configuration.passphrase).toBe('')
    expect(store.state.configuration.format_titles).toBe(true)

    expect(store.state.configuration.undefined).toBeUndefined()
  })

  it('should load json from provided file when load is dispatched', async () => {
    await store.dispatch('configuration/load', 'config.json')

    expect(window.api.file.contents).toHaveBeenCalledTimes(1)

    expect(store.state.configuration.name).toBe('Test User')
    expect(store.state.configuration.email).toBe('testuser@example.com')
    expect(store.state.configuration.private_key).toBe('id_rsa')
    expect(store.state.configuration.passphrase).toBe('password')
    expect(store.state.configuration.format_titles).toBe(false)
  })

  it('should load when input file is not able to be parsed when load is dispatched', async () => {
    window.api.file.contents.mockImplementationOnce(() => null)

    await store.dispatch('configuration/load', 'config.json')

    expect(window.api.file.contents).toHaveBeenCalledTimes(1)

    expect(store.state.configuration.name).toBe('')
    expect(store.state.configuration.email).toBe('')
    expect(store.state.configuration.private_key).toBe('')
    expect(store.state.configuration.passphrase).toBe('')
    expect(store.state.configuration.format_titles).toBe(true)
  })

  it('should set values from object when update is dispatched', async () => {
    const update = {
      name: 'New Name',
      passphrase: 'q1h7$u*3~y:}l$:akiKUa&z%:VhDP|'
    }

    await store.dispatch('configuration/update', update)

    expect(store.state.configuration.name).toBe('New Name')
    expect(store.state.configuration.email).toBe('')
    expect(store.state.configuration.private_key).toBe('')
    expect(store.state.configuration.passphrase).toBe('q1h7$u*3~y:}l$:akiKUa&z%:VhDP|')
  })

  it('should save json from provided file when configuration write is dispatched', async () => {
    await store.dispatch('configuration/write', 'config.json')

    expect(window.api.file.write).toHaveBeenCalledTimes(1)
  })

  it('should return value requested when configuration read is dispatched', async () => {
    const string_keys = [
      'name',
      'email',
      'private_key',
      'public_key',
      'passphrase',
      'default_remote',
      'light_primary',
      'light_secondary',
      'light_accent',
      'light_error',
      'light_info',
      'light_warning',
      'light_success',
      'dark_primary',
      'dark_secondary',
      'dark_accent',
      'dark_error',
      'dark_info',
      'dark_warning',
      'dark_success'
    ]

    for (const key of string_keys) {
      await store.dispatch('configuration/update', { [key]: 'value' })
      const read = await store.dispatch('configuration/read', key)

      if (key === 'public_key') {
        expect(read).toBe('ssh-rsa 1234')
      } else {
        expect(read).toBe('value')
      }
    }

    const boolean_keys = [
      'format_titles',
      'dark_mode',
      'auto_push',
      'light_primary_enabled',
      'light_secondary_enabled',
      'light_accent_enabled',
      'light_error_enabled',
      'light_info_enabled',
      'light_warning_enabled',
      'light_success_enabled',
      'dark_primary_enabled',
      'dark_secondary_enabled',
      'dark_accent_enabled',
      'dark_error_enabled',
      'dark_info_enabled',
      'dark_warning_enabled',
      'dark_success_enabled'
    ]

    for (const key of boolean_keys) {
      await store.dispatch('configuration/update', { [key]: true })
      const read_true = await store.dispatch('configuration/read', key)
      expect(read_true).toBe(true)

      await store.dispatch('configuration/update', { [key]: false })
      const read_false = await store.dispatch('configuration/read', key)
      expect(read_false).toBe(false)
    }

    const read_null = await store.dispatch('configuration/read', 'not_real_key')
    expect(read_null).toBeNull()
  })

  it('should request new ssl key when configuration generate is dispatched', async () => {
    await store.dispatch('configuration/generate', 'passphrase')

    expect(window.api.ssl.generate_private_key).toHaveBeenCalledTimes(1)
  })

  it('should present with light mode colors when update is dispatched and dark_mode is false', async () => {
    const update = { dark_mode: false, light_primary_enabled: true, light_primary: '#FFFFFF' }

    await store.dispatch('configuration/update', update)

    expect(store.state.configuration.dark_mode).toBe(false)
    expect(store.state.configuration.light_primary_enabled).toBe(true)
    expect(store.state.configuration.light_primary).toBe('#FFFFFF')

    expect(vuetify.framework.theme.themes.light.primary).toBe(update.light_primary)
  })

  it('should present with dark mode colors when update is dispatched and dark_mode is true', async () => {
    const update = { dark_mode: true, dark_primary_enabled: true, dark_primary: '#000000' }

    await store.dispatch('configuration/update', update)

    expect(store.state.configuration.dark_mode).toBe(true)
    expect(store.state.configuration.dark_primary_enabled).toBe(true)
    expect(store.state.configuration.dark_primary).toBe('#000000')

    expect(vuetify.framework.theme.themes.dark.primary).toBe(update.dark_primary)
  })
})
