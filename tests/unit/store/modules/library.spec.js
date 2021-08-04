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

const fs = {
  existsSync: jest.fn(() => true),
  readFile: jest.fn((path, encoding, callback) => callback(null, fs_read_results.join('\n'))),
  writeFile: jest.fn((file, data, options, callback) => (callback ?? options)(null))
}

const fs_read_results = [
  './first_path', './second_path', './third_path'
]

remote.require = jest.fn((target) => {
  switch (target) {
    case 'fs': return fs
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
    const paths = fs_read_results.slice()
    await store.dispatch('library/load', path)

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should add record to history on add dispatch', async () => {
    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = fs_read_results.slice()
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
    const paths = fs_read_results.slice()

    await store.dispatch('library/load', path)
    await store.dispatch('library/add', './third_path')

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should remove record from history on remove dispatch', async () => {
    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = fs_read_results.slice()

    await store.dispatch('library/load', path)
    await store.dispatch('library/remove', paths.pop())

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should not remove record from history when path does not exist on remove dispatch', async () => {
    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = fs_read_results.slice()

    await store.dispatch('library/load', path)
    await store.dispatch('library/remove', './forth_path')

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })
})
