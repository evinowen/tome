import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import Vuex from 'vuex'
import _library, { State as LibraryState } from '@/store/modules/library'
import { cloneDeep } from 'lodash'
import Disk from '../../../mocks/support/disk'
import dialog from '../../../mocks/support/dialog'
import { set_disk } from '?/builders/api/file'
import * as api_module from '@/api'
import builders from '?/builders'

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

interface State {
  library: LibraryState
}

describe('store/modules/library', () => {
  let library
  let repository
  let files

  const disk = new Disk()
  set_disk(disk)

  const factory = {
    wrap: () => new Vuex.Store<State>({
      modules: {
        library,
        repository,
        files,
      },
    }),
  }

  beforeEach(() => {
    disk.reset_disk()
    disk.set_content('./library.json', [ './first_path', './second_path', './third_path' ].join('\n'))

    dialog.reset_dialog()

    library = cloneDeep(_library)

    repository = {
      namespaced: true,
      actions: {
        load: vi.fn(),
        inspect: vi.fn(),
        clear: vi.fn(),
      },
    }

    files = {
      namespaced: true,
      actions: {
        clear: vi.fn(),
        initialize: vi.fn(),
      },
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    const store = factory.wrap()

    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])
  })

  it('should load without records file on load dispatch', async () => {
    await mocked_api.file.delete('./library.json')
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
    disk.set_content('./library.json', '')

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
    disk.set_content('./library.json', '\n\n\n\n\n\n')
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
    const paths = [ './first_path', './second_path', './third_path' ]
    await store.dispatch('library/load', path)

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should add record to history on add dispatch', async () => {
    const store = factory.wrap()

    expect(store.state.library.path).toEqual('')
    expect(store.state.library.history).toEqual([])

    const path = './library.json'
    const paths = [ './first_path', './second_path', './third_path', './fourth_path' ]

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
    const paths = [ './first_path', './second_path', './third_path' ]

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
    const paths = [ './first_path', './second_path', './third_path' ]

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
    const paths = [ './first_path', './second_path', './third_path' ]

    await store.dispatch('library/load', path)
    await store.dispatch('library/remove', './forth_path')

    expect(store.state.library.path).toEqual(path)
    expect(store.state.library.history).toEqual(paths)
  })

  it('should call to select_directory on select dispatch', async () => {
    const store = factory.wrap()

    await store.dispatch('library/select')
    expect(mocked_api.file.select_directory).toHaveBeenCalled()
  })

  it('should return quickly when select cancelled with undefined result on select dispatch', async () => {
    dialog.trip_canceled_dialog()

    const store = factory.wrap()

    const result = await store.dispatch('library/select')
    expect(result).toBeUndefined()
  })

  it('should call to open on successful select after select dispatch', async () => {
    library.actions.open = vi.fn()

    const store = factory.wrap()

    await store.dispatch('library/select')

    expect(library.actions.open).toHaveBeenCalled()
  })

  it('should cascade clears on close dispatch', async () => {
    const store = factory.wrap()
    await store.dispatch('library/close')

    expect(repository.actions.clear).toHaveBeenCalled()
    expect(files.actions.clear).toHaveBeenCalled()
  })
})
