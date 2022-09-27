import Vuex from 'vuex'

import { createLocalVue } from '@vue/test-utils'
import _library from '@/store/modules/library'
import { cloneDeep } from 'lodash'

import builders from '?/builders'

Object.assign(window, builders.window())

window._.set_content(['./first_path', './second_path', './third_path'].join('\n'))

describe('store/modules/library.js', () => {
  let localVue

  let library
  let tome
  let files

  const factory = {
    wrap: () => new Vuex.Store({
      modules: {
        library,
        tome,
        files
      }
    })
  }

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    window._.reset_disk()
    window._.reset_dialog()

    library = cloneDeep(_library)

    tome = {
      namespaced: true,
      actions: {
        load: jest.fn(),
        inspect: jest.fn(),
        clear: jest.fn()
      }
    }

    files = {
      namespaced: true,
      actions: {
        clear: jest.fn(),
        initialize: jest.fn()
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    const store = factory.wrap()

    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])
  })

  it('should load without records file on load dispatch', async () => {
    await window.api.file.delete('./library.json')
    const store = factory.wrap()

    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = []
    await store.dispatch('library/load', path)

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should load if file history fails on load dispatch', async () => {
    window.api.file.contents.mockImplementationOnce(() => null)

    const store = factory.wrap()

    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = []
    await store.dispatch('library/load', path)

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should load even without records on load dispatch', async () => {
    window.api.file.contents.mockImplementationOnce(() => '\n\n\n\n\n\n')
    const store = factory.wrap()

    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = []
    await store.dispatch('library/load', path)

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should load history from records on load dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = ['./first_path', './second_path', './third_path']
    await store.dispatch('library/load', path)

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should add record to history on add dispatch', async () => {
    const store = factory.wrap()

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
    const store = factory.wrap()

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
    const store = factory.wrap()

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
    const store = factory.wrap()

    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = ['./first_path', './second_path', './third_path']

    await store.dispatch('library/load', path)
    await store.dispatch('library/remove', './forth_path')

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should call to select_directory on select dispatch', async () => {
    const store = factory.wrap()

    await store.dispatch('library/select')
    expect(window.api.file.select_directory).toHaveBeenCalled()
  })

  it('should return quickly when select cancelled with undefined result on select dispatch', async () => {
    window._.trip_canceled_dialog()

    const store = factory.wrap()

    const result = await store.dispatch('library/select')
    expect(result).toBeUndefined()
  })

  it('should call to open on successful select after select dispatch', async () => {
    library.actions.open = jest.fn()

    const store = factory.wrap()

    await store.dispatch('library/select')

    expect(library.actions.open).toHaveBeenCalled()
  })

  it('should cascade clears on close dispatch', async () => {
    const store = factory.wrap()
    await store.dispatch('library/close')

    expect(tome.actions.clear).toHaveBeenCalled()
    expect(files.actions.clear).toHaveBeenCalled()
  })
})
