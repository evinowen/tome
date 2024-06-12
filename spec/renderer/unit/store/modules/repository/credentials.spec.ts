import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_repository_credentials_store } from '@/store/modules/repository/credentials'
import { fetch_configuration_store } from '@/store/modules/configuration'
import * as api_module from '@/api'
import builders from '?/builders'

vi.mock('@/store/modules/configuration')

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/repository/credentials', () => {
  let repository_credentials

  let mocked_fetch_configuration_store
  let mocked_fetch_configuration

  beforeEach(() => {
    setActivePinia(createPinia())

    mocked_fetch_configuration = {
      active: {
        credentials: {
          type: 'password',
          username: 'username',
          password: 'password',
          private_key: 'private_key',
          passphrase: 'passphrase',
        },
      },
    }

    mocked_fetch_configuration_store = vi.mocked(fetch_configuration_store)
    mocked_fetch_configuration_store.mockReturnValue(mocked_fetch_configuration)

    repository_credentials = fetch_repository_credentials_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should trigger api.repository.credential_password when credential type is set to "password" upon call to load', async () => {
    mocked_fetch_configuration.active.credentials.type = 'password'

    await repository_credentials.load()

    expect(mocked_api.repository.credential_password).toHaveBeenCalledTimes(1)
  })

  it('should trigger api.repository.credential_key when credential type is set to "key" upon call to load', async () => {
    mocked_fetch_configuration.active.credentials.type = 'key'

    await repository_credentials.load()

    expect(mocked_api.repository.credential_key).toHaveBeenCalledTimes(1)
  })

  it('should set visible true upon call to prompt', async () => {
    repository_credentials.visible = false

    repository_credentials.prompt()

    expect(repository_credentials.visible).toEqual(true)
  })

  it('should return Prmoise for awaiting input upon call to prompt', async () => {
    const result = repository_credentials.prompt()

    expect(result instanceof Promise).toEqual(true)
  })

  it('should set visible false upon call to cancel', async () => {
    repository_credentials.visible = true

    await repository_credentials.cancel()

    expect(repository_credentials.visible).toEqual(false)
  })

  it('should call reject when set upon call to cancel', async () => {
    repository_credentials.reject = vi.fn()

    await repository_credentials.cancel()

    expect(repository_credentials.reject).toHaveBeenCalled()
  })
})
