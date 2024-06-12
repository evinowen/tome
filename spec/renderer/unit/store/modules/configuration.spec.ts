import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import Disk from '../../../mocks/support/disk'
import { set_disk } from '?/builders/api/file'
import * as api_module from '@/api'
import builders from '?/builders'

vi.mock('@/store/modules/log', () => ({
  fetch_log_store: vi.fn(() => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  })),
}))

vi.mock('@/store/modules/repository', () => ({
  fetch_repository_store: vi.fn(() => ({
    path: '/project',
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
    key: 'id_rsa',
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
    expect(configuration.global.signature.name).toBe('')
    expect(configuration.global.signature.email).toBe('')
    expect(configuration.global.credentials.key).toBe('')
    expect(configuration.global.credentials.passphrase).toBe('')
    expect(configuration.global.format_explorer_titles).toBe(true)

    expect(configuration.local.signature.name).toBe('')
    expect(configuration.local.signature.email).toBe('')
    expect(configuration.local.credentials.key).toBe('')
    expect(configuration.local.credentials.passphrase).toBe('')
    expect(configuration.local.format_explorer_titles).toBe(true)

    expect(configuration.undefined).toBeUndefined()
  })

  it('should load json from provided file when load_global is dispatched', async () => {
    mocked_api.file.exists.mockReturnValue(Promise.resolve(true))
    mocked_api.file.contents.mockReturnValue(Promise.resolve(JSON.stringify({
      signature: {
        name: 'Test User',
        email: 'testuser@example.com',
      },
      credentials: {
        key: 'id_rsa',
        passphrase: 'password',
      },
      format_explorer_titles: false,
      dark_mode: true,
    })))

    await configuration.load_global()

    expect(mocked_api.file.contents).toHaveBeenCalledTimes(1)

    expect(configuration.global.signature.name).toBe('Test User')
    expect(configuration.global.signature.email).toBe('testuser@example.com')
    expect(configuration.global.credentials.key).toBe('id_rsa')
    expect(configuration.global.credentials.passphrase).toBe('password')
    expect(configuration.global.format_explorer_titles).toBe(false)
  })

  it('should load json from provided file when load_local is dispatched', async () => {
    mocked_api.file.exists.mockReturnValue(Promise.resolve(true))
    mocked_api.file.contents.mockReturnValue(Promise.resolve(JSON.stringify({
      signature: {
        name: 'Test User',
        email: 'testuser@example.com',
      },
      credentials: {
        key: 'id_rsa',
        passphrase: 'password',
      },
      format_explorer_titles: false,
      dark_mode: true,
    })))

    await configuration.load_local()

    expect(mocked_api.file.contents).toHaveBeenCalledTimes(1)

    expect(configuration.local.signature.name).toBe('Test User')
    expect(configuration.local.signature.email).toBe('testuser@example.com')
    expect(configuration.local.credentials.key).toBe('id_rsa')
    expect(configuration.local.credentials.passphrase).toBe('password')
    expect(configuration.local.format_explorer_titles).toBe(false)
  })

  it('should load when input file is not able to be parsed when load_global is dispatched', async () => {
    mocked_api.file.contents.mockImplementationOnce(() => Promise.resolve(''))

    await configuration.load_global()

    expect(mocked_api.file.contents).toHaveBeenCalledTimes(1)

    expect(configuration.global.signature.name).toBe('')
    expect(configuration.global.signature.email).toBe('')
    expect(configuration.global.credentials.key).toBe('')
    expect(configuration.global.credentials.passphrase).toBe('')
    expect(configuration.global.format_explorer_titles).toBe(true)
  })

  it('should load when input file is not able to be parsed when load_local is dispatched', async () => {
    mocked_api.file.contents.mockImplementationOnce(() => Promise.resolve(''))

    await configuration.load_local()

    expect(mocked_api.file.contents).toHaveBeenCalledTimes(1)

    expect(configuration.local.signature.name).toBe('')
    expect(configuration.local.signature.email).toBe('')
    expect(configuration.local.credentials.key).toBe('')
    expect(configuration.local.credentials.passphrase).toBe('')
    expect(configuration.local.format_explorer_titles).toBe(true)
  })

  it('should create new file when file does not exist when load_global is dispatched', async () => {
    mocked_api.file.exists.mockReturnValue(Promise.resolve(false))

    await configuration.load_global()

    expect(mocked_api.file.write).toHaveBeenCalledTimes(1)

    expect(configuration.global.signature.name).toBe('')
    expect(configuration.global.signature.email).toBe('')
    expect(configuration.global.credentials.key).toBe('')
    expect(configuration.global.credentials.passphrase).toBe('')
    expect(configuration.global.format_explorer_titles).toBe(true)
  })

  it('should create new file when file does not exist when load_local is dispatched', async () => {
    mocked_api.file.exists.mockReturnValue(Promise.resolve(false))

    await configuration.load_local()

    expect(mocked_api.file.write).toHaveBeenCalledTimes(2)

    expect(configuration.local.signature.name).toBe('')
    expect(configuration.local.signature.email).toBe('')
    expect(configuration.local.credentials.key).toBe('')
    expect(configuration.local.credentials.passphrase).toBe('')
    expect(configuration.local.format_explorer_titles).toBe(true)
  })

  it('should set global values from object when update is dispatched with SettingsTarget.Global', async () => {
    const name = 'New Name'
    const passphrase = 'q1h7$u*3~y:}l$:akiKUa&z%:VhDP|'

    await configuration.update(SettingsTarget.Global, 'signature.name', name)
    await configuration.update(SettingsTarget.Global, 'credentials.passphrase', passphrase)

    expect(configuration.global.signature.name).toBe('New Name')
    expect(configuration.global.signature.email).toBe('')
    expect(configuration.global.credentials.key).toBe('')
    expect(configuration.global.credentials.passphrase).toBe('q1h7$u*3~y:}l$:akiKUa&z%:VhDP|')
  })

  it('should set global values from object when update is dispatched with SettingsTarget.Global', async () => {
    const name = 'New Name'
    const passphrase = 'q1h7$u*3~y:}l$:akiKUa&z%:VhDP|'

    await configuration.update(SettingsTarget.Local, 'signature.name', name)
    await configuration.update(SettingsTarget.Local, 'credentials.passphrase', passphrase)

    expect(configuration.local.signature.name).toBe('New Name')
    expect(configuration.local.signature.email).toBe('')
    expect(configuration.local.credentials.key).toBe('')
    expect(configuration.local.credentials.passphrase).toBe('q1h7$u*3~y:}l$:akiKUa&z%:VhDP|')
  })

  it('should save json from provided file when configuration write is dispatched', async () => {
    await configuration.write(SettingsTarget.Global)

    expect(mocked_api.file.write).toHaveBeenCalledTimes(1)
  })

  it('should request new ssl key when configuration generate is dispatched', async () => {
    await configuration.generate(SettingsTarget.Global, 'passphrase')

    expect(mocked_api.ssl.generate_private_key).toHaveBeenCalledTimes(1)
  })

  it('should present with light mode colors when update is dispatched and dark_mode is false', async () => {
    const dark_mode = false
    const light_primary_enabled = true
    const light_primary = '#FFFFFF'

    await configuration.update(SettingsTarget.Global, 'dark_mode', dark_mode)
    await configuration.update(SettingsTarget.Global, 'light_primary_enabled', light_primary_enabled)
    await configuration.update(SettingsTarget.Global, 'light_primary', light_primary)

    expect(configuration.global.dark_mode).toBe(false)
    expect(configuration.global.light_primary_enabled).toBe(true)
    expect(configuration.global.light_primary).toBe('#FFFFFF')
  })

  it('should present with dark mode colors when update is dispatched and dark_mode is true', async () => {
    const dark_mode = true
    const dark_primary_enabled = true
    const dark_primary = '#000000'

    await configuration.update(SettingsTarget.Global, 'dark_mode', dark_mode)
    await configuration.update(SettingsTarget.Global, 'dark_primary_enabled', dark_primary_enabled)
    await configuration.update(SettingsTarget.Global, 'dark_primary', dark_primary)

    expect(configuration.global.dark_mode).toBe(true)
    expect(configuration.global.dark_primary_enabled).toBe(true)
    expect(configuration.global.dark_primary).toBe('#000000')
  })

  it('should set target upon call to view method', async () => {
    expect(configuration.target).toBe(SettingsTarget.Global)

    configuration.view(SettingsTarget.Local)

    expect(configuration.target).toBe(SettingsTarget.Local)

    configuration.view(SettingsTarget.Global)

    expect(configuration.target).toBe(SettingsTarget.Global)
  })

  it('should update localized flag upon call to localize method', async () => {
    expect(configuration.localized.signature).toEqual(false)

    configuration.localize('signature', true)

    expect(configuration.localized.signature).toEqual(true)

    configuration.localize('signature', false)

    expect(configuration.localized.signature).toEqual(false)
  })

  it('should clear local settings upon call to reset_local method', async () => {
    mocked_api.file.exists.mockReturnValue(Promise.resolve(true))
    mocked_api.file.contents.mockReturnValue(Promise.resolve(JSON.stringify({
      signature: {
        name: 'Test User',
        email: 'testuser@example.com',
      },
      credentials: {
        key: 'id_rsa',
        passphrase: 'password',
      },
      format_explorer_titles: false,
      dark_mode: true,
    })))

    await configuration.load_local()
    configuration.localize('signature', true)
    configuration.view(SettingsTarget.Local)

    await configuration.reset_local()

    expect(configuration.local.signature.name).toBe('')
    expect(configuration.local.signature.email).toBe('')
    expect(configuration.local.credentials.key).toBe('')
    expect(configuration.local.credentials.passphrase).toBe('')
    expect(configuration.local.format_explorer_titles).toBe(true)

    configuration.localize('signature', false)

    expect(configuration.target).toEqual(SettingsTarget.Global)
  })
})
