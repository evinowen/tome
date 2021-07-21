import { remote } from 'electron'
import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import library from '@/store/modules/library'
import { cloneDeep } from 'lodash'

jest.mock('electron', () => ({
  remote: {
    require: jest.fn()
  }
}))

const fs_file_stream = {}

const fs = {
  existsSync: jest.fn(() => true),
  createReadStream: jest.fn(() => fs_file_stream),
  writeFile: jest.fn((file, data, options, callback) => (callback ?? options)(null))
}

const readline_interface = [
  './first_path', './second_path', './third_path'
]

const readline = {
  createInterface: jest.fn(() => readline_interface)
}

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return fs
    case 'readline': return readline
  }
})

describe('store/modules/library.js', () => {
  let localVue
  let store

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    store = new Vuex.Store(cloneDeep({
      modules: {
        library
      }
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])
  })

  it('should load history from records on load dispatch', async () => {
    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = readline_interface.slice()
    await store.dispatch('library/load', path)

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should add record to history on add dispatch', async () => {
    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = readline_interface.slice()
    paths.push('./fourth_path')

    await store.dispatch('library/load', path)
    await store.dispatch('library/add', './fourth_path')

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should not add record to history when it already exists on add dispatch', async () => {
    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = readline_interface.slice()

    await store.dispatch('library/load', path)
    await store.dispatch('library/add', './third_path')

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should remove record from history on remove dispatch', async () => {
    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = readline_interface.slice()

    await store.dispatch('library/load', path)
    await store.dispatch('library/remove', paths.pop())

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should not remove record from history when path does not exist on remove dispatch', async () => {
    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = readline_interface.slice()

    await store.dispatch('library/load', path)
    await store.dispatch('library/remove', './forth_path')

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })
})
