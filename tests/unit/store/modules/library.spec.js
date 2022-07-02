import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import library from '@/store/modules/library'
import { cloneDeep } from 'lodash'

import builders from '@/../tests/builders'

Object.assign(window, builders.window())

window._.set_content(['./first_path', './second_path', './third_path'].join('\n'))

describe('store/modules/library.js', () => {
  let localVue
  let store

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    window._.reset_disk()

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
    const paths = ['./first_path', './second_path', './third_path']
    await store.dispatch('library/load', path)

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should add record to history on add dispatch', async () => {
    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = ['./first_path', './second_path', './third_path', './fourth_path']

    await store.dispatch('library/load', path)
    await store.dispatch('library/add', './fourth_path')

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should not add record to history when it already exists on add dispatch', async () => {
    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = ['./first_path', './second_path', './third_path']

    await store.dispatch('library/load', path)
    await store.dispatch('library/add', './third_path')

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should remove record from history on remove dispatch', async () => {
    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = ['./first_path', './second_path', './third_path']

    await store.dispatch('library/load', path)
    await store.dispatch('library/remove', paths.pop())

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should not remove record from history when path does not exist on remove dispatch', async () => {
    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = ['./first_path', './second_path', './third_path']

    await store.dispatch('library/load', path)
    await store.dispatch('library/remove', './forth_path')

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })
})
