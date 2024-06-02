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
      credential_type: 'password',
      username: 'username',
      password: 'password',
      private_key: 'private_key',
      passphrase: 'passphrase',
    }

    mocked_fetch_configuration_store = vi.mocked(fetch_configuration_store)
    mocked_fetch_configuration_store.mockReturnValue(mocked_fetch_configuration)

    repository_credentials = fetch_repository_credentials_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should trigger api.repository.credential_password when credential_type is set to "password" upon load dispatch', async () => {
    mocked_fetch_configuration.credential_type = 'password'

    await repository_credentials.load()

    expect(mocked_api.repository.credential_password).toHaveBeenCalledTimes(1)
  })

  it('should trigger api.repository.credential_key when credential_type is set to "key" upon load dispatch', async () => {
    mocked_fetch_configuration.credential_type = 'key'

    await repository_credentials.load()

    expect(mocked_api.repository.credential_key).toHaveBeenCalledTimes(1)
  })
})
