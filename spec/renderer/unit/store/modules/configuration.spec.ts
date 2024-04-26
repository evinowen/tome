import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import configuration, { State as ConfigurationState } from '@/store/modules/configuration'
import Disk from '../../../mocks/support/disk'
import { set_disk } from '?/builders/api/file'
import * as api_module from '@/api'
import builders from '?/builders'
import { scafold as store_scafold } from '?/builders/store'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  configuration: ConfigurationState
}

describe('store/modules/configuration', () => {
  let store

  const disk = new Disk()
  set_disk(disk)

  disk.set_content_default(JSON.stringify({
    name: 'Test User',
    email: 'testuser@example.com',
    private_key: 'id_rsa',
    passphrase: 'password',
    format_titles: false,
    dark_mode: true,
  }))

  beforeEach(() => {
    disk.reset_disk()

    store = new Vuex.Store<State>(store_scafold({
      modules: {
        configuration,
      },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
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

    expect(mocked_api.file.contents).toHaveBeenCalledTimes(1)

    expect(store.state.configuration.name).toBe('Test User')
    expect(store.state.configuration.email).toBe('testuser@example.com')
    expect(store.state.configuration.private_key).toBe('id_rsa')
    expect(store.state.configuration.passphrase).toBe('password')
    expect(store.state.configuration.format_titles).toBe(false)
  })

  it('should load when input file is not able to be parsed when load is dispatched', async () => {
    mocked_api.file.contents.mockImplementationOnce(() => Promise.resolve(''))

    await store.dispatch('configuration/load', 'config.json')

    expect(mocked_api.file.contents).toHaveBeenCalledTimes(1)

    expect(store.state.configuration.name).toBe('')
    expect(store.state.configuration.email).toBe('')
    expect(store.state.configuration.private_key).toBe('')
    expect(store.state.configuration.passphrase).toBe('')
    expect(store.state.configuration.format_titles).toBe(true)
  })

  it('should set values from object when update is dispatched', async () => {
    const update = {
      name: 'New Name',
      passphrase: 'q1h7$u*3~y:}l$:akiKUa&z%:VhDP|',
    }

    await store.dispatch('configuration/update', update)

    expect(store.state.configuration.name).toBe('New Name')
    expect(store.state.configuration.email).toBe('')
    expect(store.state.configuration.private_key).toBe('')
    expect(store.state.configuration.passphrase).toBe('q1h7$u*3~y:}l$:akiKUa&z%:VhDP|')
  })

  it('should save json from provided file when configuration write is dispatched', async () => {
    await store.dispatch('configuration/write', 'config.json')

    expect(mocked_api.file.write).toHaveBeenCalledTimes(1)
  })

  it('should return value requested when configuration read is dispatched', async () => {
    const string_keys = [
      'name',
      'email',
      'private_key',
      'public_key',
      'passphrase',
      'default_remote',
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
    ]

    for (const key of boolean_keys) {
      await store.dispatch('configuration/update', { [key]: true })
      const read_true = await store.dispatch('configuration/read', key)
      expect(read_true).toBe(true)

      await store.dispatch('configuration/update', { [key]: false })
      const read_false = await store.dispatch('configuration/read', key)
      expect(read_false).toBe(false)
    }

    const read_undefined = await store.dispatch('configuration/read', 'not_real_key')
    expect(read_undefined).toBeUndefined()
  })

  it('should request new ssl key when configuration generate is dispatched', async () => {
    await store.dispatch('configuration/generate', 'passphrase')

    expect(mocked_api.ssl.generate_private_key).toHaveBeenCalledTimes(1)
  })

  it('should present with light mode colors when update is dispatched and dark_mode is false', async () => {
    const update = { dark_mode: false, light_primary_enabled: true, light_primary: '#FFFFFF' }

    await store.dispatch('configuration/update', update)

    expect(store.state.configuration.dark_mode).toBe(false)
    expect(store.state.configuration.light_primary_enabled).toBe(true)
    expect(store.state.configuration.light_primary).toBe('#FFFFFF')
  })

  it('should present with dark mode colors when update is dispatched and dark_mode is true', async () => {
    const update = { dark_mode: true, dark_primary_enabled: true, dark_primary: '#000000' }

    await store.dispatch('configuration/update', update)

    expect(store.state.configuration.dark_mode).toBe(true)
    expect(store.state.configuration.dark_primary_enabled).toBe(true)
    expect(store.state.configuration.dark_primary).toBe('#000000')
  })
})
