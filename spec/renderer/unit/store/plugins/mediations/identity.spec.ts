import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import identity from '@/store/plugins/mediations/identity'

describe('store/plugins/mediations/identity', () => {
  let store
  let repository
  let system

  beforeEach(() => {
    repository = {
      namespaced: true,
      actions: {
        remote: vi.fn()
      },
      modules: {
        credentials: {
          namespaced: true,
          state: {
            key: '',
            passphrase: ''
          },
          mutations: {
            set: (state, { key, value }) => {
              state[key] = value
            }
          },
          actions: {
            set: (context, data) => {
              context.commit('set', data)
            },
            private_key: vi.fn(),
            passphrase: vi.fn()
          }
        },
        signature: {
          namespaced: true,
          actions: {
            name: vi.fn(),
            email: vi.fn(),
            message: vi.fn()
          }
        }
      }
    }

    system = {
      namespaced: true,
      state: {
        signature: {
          name: '',
          email: '',
          message: ''
        },
        credentials: {
          private_key: '',
          passphrase: ''
        }
      },
      mutations: {
        signature: (state, { key, value }) => {
          state.signature[key] = value
        },
        credentials: (state, { key, value }) => {
          state.credentials[key] = value
        }
      },
      actions: {
        signature: (context, data) => {
          context.commit('signature', data)
        },
        credentials: (context, data) => {
          context.commit('credentials', data)
        }
      }
    }

    store = new Vuex.Store({
      modules: {
        repository,
        system
      },
      plugins: [
        identity
      ]
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch repository signature name action when tome key value changes', async () => {
    expect(repository.modules.signature.actions.name).toHaveBeenCalledTimes(0)

    await store.dispatch('system/signature', { key: 'name', value: 'value' })

    expect(repository.modules.signature.actions.name).toHaveBeenCalledTimes(1)
  })

  it('should dispatch repository signature email action when tome key value changes', async () => {
    expect(repository.modules.signature.actions.email).toHaveBeenCalledTimes(0)

    await store.dispatch('system/signature', { key: 'email', value: 'value' })

    expect(repository.modules.signature.actions.email).toHaveBeenCalledTimes(1)
  })

  it('should dispatch repository signature message action when tome key value changes', async () => {
    expect(repository.modules.signature.actions.message).toHaveBeenCalledTimes(0)

    await store.dispatch('system/signature', { key: 'message', value: 'value' })

    expect(repository.modules.signature.actions.message).toHaveBeenCalledTimes(1)
  })

  it('should dispatch repository credentials private_key action when tome key value changes', async () => {
    expect(repository.modules.credentials.actions.private_key).toHaveBeenCalledTimes(0)

    await store.dispatch('system/credentials', { key: 'private_key', value: 'value' })

    expect(repository.modules.credentials.actions.private_key).toHaveBeenCalledTimes(1)
  })

  it('should dispatch repository credentials passphrase action when tome key value changes', async () => {
    expect(repository.modules.credentials.actions.passphrase).toHaveBeenCalledTimes(0)

    await store.dispatch('system/credentials', { key: 'passphrase', value: 'value' })

    expect(repository.modules.credentials.actions.passphrase).toHaveBeenCalledTimes(1)
  })

  it('should dispatch repository remote action when tome key value changes', async () => {
    expect(repository.actions.remote).toHaveBeenCalledTimes(0)

    await store.dispatch('repository/credentials/set', { key: 'key', value: 'value' })

    expect(repository.actions.remote).toHaveBeenCalledTimes(1)
  })

  it('should dispatch repository remote action when tome passphrase value changes', async () => {
    expect(repository.actions.remote).toHaveBeenCalledTimes(0)

    await store.dispatch('repository/credentials/set', { key: 'passphrase', value: 'value' })

    expect(repository.actions.remote).toHaveBeenCalledTimes(1)
  })
})
