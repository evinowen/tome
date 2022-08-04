import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import configuration from '@/store/modules/configuration'
import { cloneDeep } from 'lodash'

import builders from '@/../tests/builders'

Object.assign(window, builders.window())

window._.set_content(JSON.stringify({
  name: 'Test User',
  email: 'testuser@example.com',
  private_key: 'id_rsa',
  passphrase: 'password',
  format_titles: false,
  dark_mode: true
}))

describe('store/modules/configuration.js', () => {
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

  it('should load json from provided file when loadConfiguration is dispatched', async () => {
    await store.dispatch('configuration/load', 'config.json')

    expect(window.api.file_contents).toHaveBeenCalledTimes(1)

    expect(store.state.configuration.name).toBe('Test User')
    expect(store.state.configuration.email).toBe('testuser@example.com')
    expect(store.state.configuration.private_key).toBe('id_rsa')
    expect(store.state.configuration.passphrase).toBe('password')
    expect(store.state.configuration.format_titles).toBe(false)
  })

  it('should set values from object when updateConfiguration is dispatched', async () => {
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

    expect(window.api.file_write).toHaveBeenCalledTimes(1)
  })
})
