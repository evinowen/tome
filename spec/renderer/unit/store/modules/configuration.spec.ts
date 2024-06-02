import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_configuration_store } from '@/store/modules/configuration'
import Disk from '../../../mocks/support/disk'
import { set_disk } from '?/builders/api/file'
import * as api_module from '@/api'
import builders from '?/builders'

vi.mock('@/store/log', () => ({
  fetch_log_store: vi.fn(() => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  })),
}))

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/configuration', () => {
  let configuration

  const disk = new Disk()
  set_disk(disk)

  disk.set_content_default(JSON.stringify({
    name: 'Test User',
    email: 'testuser@example.com',
    private_key: 'id_rsa',
    passphrase: 'password',
    format_explorer_titles: false,
    dark_mode: true,
  }))

  beforeEach(() => {
    setActivePinia(createPinia())

    disk.reset_disk()

    configuration = fetch_configuration_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    expect(configuration.name).toBe('')
    expect(configuration.email).toBe('')
    expect(configuration.private_key).toBe('')
    expect(configuration.passphrase).toBe('')
    expect(configuration.format_explorer_titles).toBe(true)

    expect(configuration.undefined).toBeUndefined()
  })

  it('should load json from provided file when load is dispatched', async () => {
    mocked_api.file.exists.mockReturnValue(Promise.resolve(true))
    mocked_api.file.contents.mockReturnValue(Promise.resolve(JSON.stringify({
      name: 'Test User',
      email: 'testuser@example.com',
      private_key: 'id_rsa',
      passphrase: 'password',
      format_explorer_titles: false,
      dark_mode: true,
    })))

    await configuration.load()

    expect(mocked_api.file.contents).toHaveBeenCalledTimes(1)

    expect(configuration.name).toBe('Test User')
    expect(configuration.email).toBe('testuser@example.com')
    expect(configuration.private_key).toBe('id_rsa')
    expect(configuration.passphrase).toBe('password')
    expect(configuration.format_explorer_titles).toBe(false)
  })

  it('should load when input file is not able to be parsed when load is dispatched', async () => {
    mocked_api.file.contents.mockImplementationOnce(() => Promise.resolve(''))

    await configuration.load()

    expect(mocked_api.file.contents).toHaveBeenCalledTimes(1)

    expect(configuration.name).toBe('')
    expect(configuration.email).toBe('')
    expect(configuration.private_key).toBe('')
    expect(configuration.passphrase).toBe('')
    expect(configuration.format_explorer_titles).toBe(true)
  })

  it('should set values from object when update is dispatched', async () => {
    const update = {
      name: 'New Name',
      passphrase: 'q1h7$u*3~y:}l$:akiKUa&z%:VhDP|',
    }

    await configuration.update(update)

    expect(configuration.name).toBe('New Name')
    expect(configuration.email).toBe('')
    expect(configuration.private_key).toBe('')
    expect(configuration.passphrase).toBe('q1h7$u*3~y:}l$:akiKUa&z%:VhDP|')
  })

  it('should save json from provided file when configuration write is dispatched', async () => {
    await configuration.write('config.json')

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
      await configuration.update({ [key]: 'value' })
      const read = await configuration.read(key)

      if (key === 'public_key') {
        expect(read).toBe('ssh-rsa 1234')
      } else {
        expect(read).toBe('value')
      }
    }

    const boolean_keys = [
      'format_explorer_titles',
      'dark_mode',
      'auto_push',
    ]

    for (const key of boolean_keys) {
      await configuration.update({ [key]: true })
      const read_true = await configuration.read(key)
      expect(read_true).toBe(true)

      await configuration.update({ [key]: false })
      const read_false = await configuration.read(key)
      expect(read_false).toBe(false)
    }

    const read_undefined = await configuration.read('not_real_key')
    expect(read_undefined).toBeUndefined()
  })

  it('should request new ssl key when configuration generate is dispatched', async () => {
    await configuration.generate('passphrase')

    expect(mocked_api.ssl.generate_private_key).toHaveBeenCalledTimes(1)
  })

  it('should present with light mode colors when update is dispatched and dark_mode is false', async () => {
    const update = { dark_mode: false, light_primary_enabled: true, light_primary: '#FFFFFF' }

    await configuration.update(update)

    expect(configuration.dark_mode).toBe(false)
    expect(configuration.light_primary_enabled).toBe(true)
    expect(configuration.light_primary).toBe('#FFFFFF')
  })

  it('should present with dark mode colors when update is dispatched and dark_mode is true', async () => {
    const update = { dark_mode: true, dark_primary_enabled: true, dark_primary: '#000000' }

    await configuration.update(update)

    expect(configuration.dark_mode).toBe(true)
    expect(configuration.dark_primary_enabled).toBe(true)
    expect(configuration.dark_primary).toBe('#000000')
  })
})
