import { remote } from 'electron'
import Vue from 'vue'
import Vuex from 'vuex'
import configuration from '@/store/modules/configuration'

Vue.use(Vuex)

jest.mock('electron', () => ({
  remote: {
    require: jest.fn()
  }
}))

let json;

const fs = {
  readFile: jest.fn(() => Promise.resolve(json)),
  writeFile: jest.fn()
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return fs
  }
})

describe('store/modules/configuration.js', () => {
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        configuration
      }
    })

    json = JSON.stringify({
      name: 'Test User',
      email: 'testuser@example.com',
      private_key: 'id_rsa',
      public_key: 'id_rsa.pub',
      passphrase: 'password'
    })
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

  it('should save json from provided file when writeConfiguration is dispatched', async () => {
    await store.dispatch('writeConfiguration', 'config.json')

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
  })
})
