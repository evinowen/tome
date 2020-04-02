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

const fs = {
  readFile: jest.fn(),
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
  })

  it('should load json from provided file when loadConfiguration is dispatched', async () => {
    await store.dispatch('loadConfiguration', 'config.json')

    expect(fs.readFile).toHaveBeenCalledTimes(1)
  })

  it('should save json from provided file when writeConfiguration is dispatched', async () => {
    await store.dispatch('writeConfiguration', 'config.json')

    expect(fs.writeFile).toHaveBeenCalledTimes(1)
  })
})
