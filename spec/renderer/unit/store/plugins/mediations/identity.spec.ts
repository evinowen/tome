import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import identity from '@/store/plugins/mediations/identity'

describe('store/plugins/mediations/identity', () => {
  let localVue
  let store
  let repository
  let system

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    repository = {
      namespaced: true,
      actions: {
        remote: jest.fn()
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
            private_key: jest.fn(),
            passphrase: jest.fn()
          }
        },
        signature: {
          namespaced: true,
          actions: {
            name: jest.fn(),
            email: jest.fn(),
            message: jest.fn()
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
    jest.clearAllMocks()
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
