import { vi } from 'vitest'
import dialog from '../../mocks/support/dialog'
import Disk from '../../mocks/support/disk'

let disk: Disk

export const set_disk = (_disk: Disk) => {
  disk = _disk
}
export const get_disk = () => disk

const { result_dialog } = dialog

const _file_list_directory = async (path) => {
  const item = disk.get_disk(path)
  const result = []

  for (const [ name, file ] of item.children) {
    result.push({ name, mime: 'text/plain', directory: file.directory })
  }

  return result
}

const _file_is_directory = async (path) => {
  const item = disk.get_disk(path)
  return item && item.directory
}

const _file_exists = async (path) => {
  return disk.has_disk(path)
}

const _file_contents = async (path) => {
  if (!disk.has_disk(path)) {
    return
  }

  return disk.get_content(path)
}

const _file_create = async (path) => {
  if (disk.has_disk(path)) {
    return false
  }

  disk.set_disk(path)
  return disk.has_disk(path)
}

const _file_create_directory = async (path) => {
  if (disk.has_disk(path)) {
    return false
  }

  disk.set_disk(path, {})
  return disk.has_disk(path)
}

const _file_delete = async (path) => {
  if (!disk.has_disk(path)) {
    return false
  }

  disk.unset_disk(path)
  return !disk.has_disk(path)
}

const _file_rename = async (path, proposed) => {
  if (!disk.has_disk(path)) {
    return false
  }

  const value = disk.get_disk(path)
  disk.unset_disk(path)
  disk.set_disk(proposed, value)
  return !disk.has_disk(path) && disk.has_disk(proposed)
}

const _file_write = async (path, value) => {
  disk.set_disk(path, value)
  return true
}

const _file_write_library = async (path, files) => {
  disk.set_disk(path, files.join('\n'))
  return true
}

const _directory_list = async (path) => {
  const item = disk.get_disk(path)

  if (!item) {
    return []
  }

  return item.children.keys()
}

const _select_directory = async () => {
  return result_dialog()
}

const _search_next_result = {
  path: {
    absolute: '/project/path',
    relative: 'path',
    matched: true,
  },
  directory: false,
  matches: [],
}

export default {
  file: {
    subscribe: vi.fn(),
    clear_subscriptions: vi.fn(),
    contents: vi.fn(_file_contents),
    create: vi.fn(_file_create),
    create_directory: vi.fn(_file_create_directory),
    exists: vi.fn(_file_exists),
    delete: vi.fn(_file_delete),
    is_directory: vi.fn(_file_is_directory),
    list_directory: vi.fn(_file_list_directory),
    rename: vi.fn(_file_rename),
    open: vi.fn(),
    write: vi.fn(_file_write),
    write_library: vi.fn(_file_write_library),
    directory_list: vi.fn(_directory_list),
    select_directory: vi.fn(_select_directory),
    search_path: vi.fn(),
    search_next: vi.fn().mockReturnValue({ path: undefined }).mockReturnValueOnce(_search_next_result),
  },
}
