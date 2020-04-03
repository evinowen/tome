import { remote } from 'electron'
import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import configuration from '@/store/modules/configuration'
import { cloneDeep } from 'lodash'

jest.mock('electron', () => ({
  remote: {
    require: jest.fn()
  }
}))

let json

const fs_callback = (options, callback) => (options && callback ? callback : options)(null, json)

const fs = {
  readFile: jest.fn((path, options, callback) => fs_callback(options, callback)),
  writeFile: jest.fn((file, data, options, callback) => fs_callback(options, callback))
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return fs
  }
})

describe('store/modules/configuration.js', () => {
  let localVue
  let store

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store(cloneDeep({
      modules: {
        configuration
      }
    }))

    json = JSON.stringify({
      name: 'Test User',
      email: 'testuser@example.com',
      private_key: 'id_rsa',
      public_key: 'id_rsa.pub',
      passphrase: 'password'
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    expect(store.state.configuration.name).toBe('')
    expect(store.state.configuration.email).toBe('')
    expect(store.state.configuration.private_key).toBe('')
    expect(store.state.configuration.public_key).toBe('')
    expect(store.state.configuration.passphrase).toBe('')

    expect(store.state.configuration.undefined).toBeUndefined()
  })

  it('should load json from provided file when loadConfiguration is dispatched', async () => {
    await store.dispatch('loadConfiguration', 'config.json')

    expect(fs.readFile).toHaveBeenCalledTimes(1)

    expect(store.state.configuration.name).toBe('Test User')
    expect(store.state.configuration.email).toBe('testuser@example.com')
    expect(store.state.configuration.private_key).toBe('id_rsa')
    expect(store.state.configuration.public_key).toBe('id_rsa.pub')
    expect(store.state.configuration.passphrase).toBe('password')
  })

  it('should set values from object when updateConfiguration is dispatched', async () => {
    const update = {
      name: 'New Name',
      passphrase: 'q1h7$u*3~y:}l$:akiKUa&z%:VhDP|'
    }

    await store.dispatch('updateConfiguration', update)

    expect(store.state.configuration.name).toBe('New Name')
    expect(store.state.configuration.email).toBe('')
    expect(store.state.configuration.private_key).toBe('')
    expect(store.state.configuration.public_key).toBe('')
    expect(store.state.configuration.passphrase).toBe('q1h7$u*3~y:}l$:akiKUa&z%:VhDP|')
  })

  it('should save json from provided file when writeConfiguration is dispatched', async () => {
    const json = JSON.stringify({
      name: '',
      email: '',
      private_key: '',
      public_key: '',
      passphrase: ''
    })

    await store.dispatch('writeConfiguration', 'config.json')

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
    expect(fs.writeFile.mock.calls[0][1]).toBe(json)
  })
})
