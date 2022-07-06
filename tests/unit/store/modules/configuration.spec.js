import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import configuration from '@/store/modules/configuration'
import { cloneDeep } from 'lodash'

import builders from '@/../tests/builders'

Object.assign(window, builders.window())

// jest.mock('electron', () => ({
//   remote: {
//     require: jest.fn()
//   }
// }))

// const fs_callback_json = JSON.stringify({
//   name: 'Test User',
//   email: 'testuser@example.com',
//   private_key: 'id_rsa',
//   public_key: 'id_rsa.pub',
//   passphrase: 'password',
//   format_titles: false,
//   dark_mode: true
// })

window._.set_content(JSON.stringify({
  name: 'Test User',
  email: 'testuser@example.com',
  private_key: 'id_rsa',
  public_key: 'id_rsa.pub',
  passphrase: 'password',
  format_titles: false,
  dark_mode: true
}))

// const fs_callback = (options, callback) => (options && callback ? callback : options)(null, fs_callback_json)
// const fs_callback_error = (options, callback) => (options && callback ? callback : options)('error!')

// const fs = {
//   readFile: jest.fn((path, options, callback) => fs_callback(options, callback)),
//   writeFile: jest.fn((file, data, options, callback) => fs_callback(options, callback))
// }

describe('store/modules/configuration.js', () => {
  let localVue
  let store

  let json

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    window._.reset_disk()

    store = new Vuex.Store(cloneDeep({
      modules: {
        configuration
      }
    }))

    json = JSON.stringify(configuration.state)
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
    expect(store.state.configuration.format_titles).toBe(true)

    expect(store.state.configuration.undefined).toBeUndefined()
  })

  // it('should throw error if unable to load from provided file when loadConfiguration is dispatched', async () => {
  //   // fs.readFile.mockImplementationOnce((path, options, callback) => fs_callback_error(options, callback))

  //   await expect(store.dispatch('configuration/load', 'config.json')).rejects.toBe('error!')

  //   expect(window.api.file_contents).toHaveBeenCalledTimes(1)
  // })

  it('should load json from provided file when loadConfiguration is dispatched', async () => {
    await store.dispatch('configuration/load', 'config.json')

    expect(window.api.file_contents).toHaveBeenCalledTimes(1)

    expect(store.state.configuration.name).toBe('Test User')
    expect(store.state.configuration.email).toBe('testuser@example.com')
    expect(store.state.configuration.private_key).toBe('id_rsa')
    expect(store.state.configuration.public_key).toBe('id_rsa.pub')
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
    expect(store.state.configuration.public_key).toBe('')
    expect(store.state.configuration.passphrase).toBe('q1h7$u*3~y:}l$:akiKUa&z%:VhDP|')
  })

  it('should save json from provided file when configuration write is dispatched', async () => {
    await store.dispatch('configuration/write', 'config.json')

    expect(window.api.file_write).toHaveBeenCalledTimes(1)
  })

  // it('should throw error if unable to save to provided file when configuration write is dispatched', async () => {
  //   // fs.writeFile.mockImplementationOnce((file, data, options, callback) => fs_callback_error(options, callback))

  //   await expect(store.dispatch('configuration/write', 'config.json')).rejects.toBe('error!')

  //   expect(window.api.file_write).toHaveBeenCalledTimes(1)
  // })
})
