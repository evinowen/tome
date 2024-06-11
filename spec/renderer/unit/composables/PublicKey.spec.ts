import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import { setActivePinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { fetch_configuration_store } from '@/store/modules/configuration'
import PublicKey, { reset as ResetPublicKey } from '@/composables/PublicKey'

/* lodash */
vi.mock('lodash', () => ({
  debounce: (callback) => {
    callback.cancel = vi.fn()
    callback.flush = vi.fn()
    return callback
  },
}))

/* @/api */
import api from '@/api'
vi.mock('@/api', () => ({
  default: {
    ssl: {
      generate_public_key: vi.fn(),
    },
  },
}))

describe('composables/PublicKey', () => {
  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })

    setActivePinia(pinia)

    const configuration = fetch_configuration_store()
    configuration.global.credentials.prompt_passphrase = true
    configuration.local.credentials.prompt_passphrase = true

    ResetPublicKey()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should not call api.ssl.generate_public_key for Global key credential on load when prompt_passphrase is true', async () => {
    const configuration = fetch_configuration_store()
    configuration.global.credentials.key = 'global-key'
    configuration.global.credentials.prompt_passphrase = true
    configuration.global.credentials.passphrase = 'global-passphrase'

    api.ssl.generate_public_key = vi.fn()

    PublicKey()
    await nextTick()

    expect(api.ssl.generate_public_key).not.toHaveBeenCalledWith(
      configuration.global.credentials.key,
      configuration.global.credentials.passphrase,
    )
  })

  it('should call api.ssl.generate_public_key for Global key credential on load when prompt_passphrase is false', async () => {
    const configuration = fetch_configuration_store()
    configuration.global.credentials.key = 'global-key'
    configuration.global.credentials.passphrase = 'global-passphrase'

    configuration.global.credentials.prompt_passphrase = false

    api.ssl.generate_public_key = vi.fn()

    PublicKey()
    await nextTick()

    expect(api.ssl.generate_public_key).toHaveBeenCalledWith(
      configuration.global.credentials.key,
      configuration.global.credentials.passphrase,
    )
  })

  it('should set error flag true and data to error message when api.ssl.generate_public_key returns error for Global key credential', async () => {
    const configuration = fetch_configuration_store()
    configuration.global.credentials.key = 'global-key'
    configuration.global.credentials.passphrase = 'global-passphrase'

    configuration.global.credentials.prompt_passphrase = false

    api.ssl.generate_public_key = async () => ({ error: 'error-message' })

    const data = PublicKey()
    await nextTick()

    expect(data.global.error).toEqual(true)
    expect(data.global.data).toEqual('error-message')
  })

  it('should set error flag false and data to result data when api.ssl.generate_public_key returns no error for Global key credential', async () => {
    const configuration = fetch_configuration_store()
    configuration.global.credentials.key = 'global-key'
    configuration.global.credentials.passphrase = 'global-passphrase'

    configuration.global.credentials.prompt_passphrase = false

    api.ssl.generate_public_key = async () => ({ data: 'ssh-rsa 1234' })

    const data = PublicKey()
    await nextTick()

    expect(data.global.error).toEqual(false)
    expect(data.global.data).toEqual('ssh-rsa 1234')
  })

  it('should not call api.ssl.generate_public_key for Local key credential on load when prompt_passphrase is true', async () => {
    const configuration = fetch_configuration_store()
    configuration.local.credentials.prompt_passphrase = true

    configuration.local.credentials.key = 'global-key'
    configuration.local.credentials.passphrase = 'global-passphrase'

    api.ssl.generate_public_key = vi.fn()

    PublicKey()
    await nextTick()

    expect(api.ssl.generate_public_key).not.toHaveBeenCalledWith(
      configuration.local.credentials.key,
      configuration.local.credentials.passphrase,
    )
  })

  it('should call api.ssl.generate_public_key for Local key credential on load when prompt_passphrase is false', async () => {
    const configuration = fetch_configuration_store()
    configuration.local.credentials.key = 'global-key'
    configuration.local.credentials.passphrase = 'global-passphrase'

    configuration.local.credentials.prompt_passphrase = false

    api.ssl.generate_public_key = vi.fn()

    PublicKey()
    await nextTick()

    expect(api.ssl.generate_public_key).toHaveBeenCalledWith(
      configuration.local.credentials.key,
      configuration.local.credentials.passphrase,
    )
  })

  it('should set error flag true and data to error message when api.ssl.generate_public_key returns error for Local key credential', async () => {
    const configuration = fetch_configuration_store()
    configuration.local.credentials.key = 'local-key'
    configuration.local.credentials.passphrase = 'local-passphrase'

    configuration.local.credentials.prompt_passphrase = false

    api.ssl.generate_public_key = async () => ({ error: 'error-message' })

    const data = PublicKey()
    await nextTick()

    expect(data.local.error).toEqual(true)
    expect(data.local.data).toEqual('error-message')
  })

  it('should set error flag false and data to result data when api.ssl.generate_public_key returns no error for Local key credential', async () => {
    const configuration = fetch_configuration_store()
    configuration.local.credentials.key = 'local-key'
    configuration.local.credentials.passphrase = 'local-passphrase'

    configuration.local.credentials.prompt_passphrase = false

    api.ssl.generate_public_key = async () => ({ data: 'ssh-rsa 1234' })

    const data = PublicKey()
    await nextTick()

    expect(data.local.error).toEqual(false)
    expect(data.local.data).toEqual('ssh-rsa 1234')
  })
})
