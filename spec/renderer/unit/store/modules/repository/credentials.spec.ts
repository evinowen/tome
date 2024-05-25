import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import credentials, { State as CredentialsState } from '@/store/modules/repository/credentials'
import { cloneDeep } from 'lodash'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  credentials: CredentialsState
}

describe('store/modules/repository/credentials', () => {
  let store

  let configuration
  let configuration_map: Map<string, string>

  const log = vi.fn()

  beforeEach(() => {
    configuration_map = new Map<string, string>([
      [ 'credential_type', 'password' ],
      [ 'username', 'username' ],
      [ 'password', 'password' ],
      [ 'private_key', 'private_key' ],
      [ 'passphrase', 'passphrase' ],
    ])

    configuration = {
      namespaced: true,
      actions: {
        read: vi.fn((context, key) => configuration_map.get(key)),
      },
    }

    store = new Vuex.Store<State>(cloneDeep({
      actions: { log },
      modules: {
        credentials,
        configuration,
      },
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should trigger api.repository.credential_password when credential_type is set to "password" upon load dispatch', async () => {
    configuration_map.set('credential_type', 'password')

    await store.dispatch('credentials/load')

    expect(mocked_api.repository.credential_password).toHaveBeenCalledTimes(1)
  })

  it('should trigger api.repository.credential_key when credential_type is set to "key" upon load dispatch', async () => {
    configuration_map.set('credential_type', 'key')

    await store.dispatch('credentials/load')

    expect(mocked_api.repository.credential_key).toHaveBeenCalledTimes(1)
  })
})
