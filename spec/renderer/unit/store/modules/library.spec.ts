import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { fetch_library_store } from '@/store/modules/library'
import { fetch_files_store } from '@/store/modules/files'
import { fetch_repository_store } from '@/store/modules/repository'
import Disk from '../../../mocks/support/disk'
import dialog from '../../../mocks/support/dialog'
import { set_disk } from '?/builders/api/file'
import * as api_module from '@/api'
import builders from '?/builders'

vi.mock('@/store/modules/files', () => ({
  fetch_files_store: vi.fn(),
}))

vi.mock('@/store/modules/repository', () => ({
  fetch_repository_store: vi.fn(),
}))

const mocked_api = builders.api()
Object.assign(api_module, { default: mocked_api })

describe('store/modules/library', () => {
  let library

  let files
  let repository

  const mock_fetch_files_store = vi.mocked(fetch_files_store)
  const mock_fetch_repository_store = vi.mocked(fetch_repository_store)

  const disk = new Disk()
  set_disk(disk)

  beforeEach(() => {
    setActivePinia(createPinia())

    disk.reset_disk()
    disk.set_content('./library.json', [ './first_path', './second_path', './third_path' ].join('\n'))

    dialog.reset_dialog()

    files = {
      clear: vi.fn(),
      initialize: vi.fn(),
    }

    mock_fetch_files_store.mockReturnValue(files)

    repository = {
      open: vi.fn(),
      clear: vi.fn(),
    }

    mock_fetch_repository_store.mockReturnValue(repository)

    library = fetch_library_store()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should populate empty values when initalized', async () => {
    expect(library.path).toEqual('')
    expect(library.history).toEqual([])
  })

  it('should load without records file on load dispatch', async () => {
    await mocked_api.file.delete('./library.json')
    expect(library.path).toEqual('')
    expect(library.history).toEqual([])

    const path = './library.json'
    const paths = []
    await library.load(path)

    expect(library.path).toEqual(path)
    expect(library.history).toEqual(paths)
  })

  it('should load if file history fails on load dispatch', async () => {
    disk.set_content('./library.json', '')

    expect(library.path).toEqual('')
    expect(library.history).toEqual([])

    const path = './library.json'
    const paths = []
    await library.load(path)

    expect(library.path).toEqual(path)
    expect(library.history).toEqual(paths)
  })

  it('should load even without records on load dispatch', async () => {
    disk.set_content('./library.json', '\n\n\n\n\n\n')
    expect(library.path).toEqual('')
    expect(library.history).toEqual([])

    const path = './library.json'
    const paths = []
    await library.load(path)

    expect(library.path).toEqual(path)
    expect(library.history).toEqual(paths)
  })

  it('should load history from records on load dispatch', async () => {
    expect(library.path).toEqual('')
    expect(library.history).toEqual([])

    const path = './library.json'
    const paths = [ './first_path', './second_path', './third_path' ]
    await library.load(path)

    expect(library.path).toEqual(path)
    expect(library.history).toEqual(paths)
  })

  it('should add record to history on add dispatch', async () => {
    expect(library.path).toEqual('')
    expect(library.history).toEqual([])

    const path = './library.json'
    const paths = [ './first_path', './second_path', './third_path', './fourth_path' ]

    await library.load(path)
    await library.add('./fourth_path')

    expect(library.path).toEqual(path)
    expect(library.history).toEqual(paths)
  })

  it('should not add record to history when it already exists on add dispatch', async () => {
    expect(library.path).toEqual('')
    expect(library.history).toEqual([])

    const path = './library.json'
    const paths = [ './first_path', './second_path', './third_path' ]

    await library.load(path)
    await library.add('./third_path')

    expect(library.path).toEqual(path)
    expect(library.history).toEqual(paths)
  })

  it('should remove record from history on remove dispatch', async () => {
    expect(library.path).toEqual('')
    expect(library.history).toEqual([])

    const path = './library.json'
    const paths = [ './first_path', './second_path', './third_path' ]

    await library.load(path)
    await library.remove(paths.pop())

    expect(library.path).toEqual(path)
    expect(library.history).toEqual(paths)
  })

  it('should not remove record from history when path does not exist on remove dispatch', async () => {
    expect(library.path).toEqual('')
    expect(library.history).toEqual([])

    const path = './library.json'
    const paths = [ './first_path', './second_path', './third_path' ]

    await library.load(path)
    await library.remove('./forth_path')

    expect(library.path).toEqual(path)
    expect(library.history).toEqual(paths)
  })

  it('should call to select_directory on select dispatch', async () => {
    await library.select()
    expect(mocked_api.file.select_directory).toHaveBeenCalled()
  })

  it('should return quickly when select cancelled with undefined result on select dispatch', async () => {
    dialog.trip_canceled_dialog()

    const result = await library.select()
    expect(result).toBeUndefined()
  })

  it('should call to open on successful select after select dispatch', async () => {
    library.open = vi.fn()

    await library.select()

    expect(library.open).toHaveBeenCalled()
  })

  it('should cascade clears on close dispatch', async () => {
    await library.close()

    expect(repository.clear).toHaveBeenCalled()
    expect(files.clear).toHaveBeenCalled()
  })
})
