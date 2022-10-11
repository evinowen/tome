import dialog from './dialog'
import disk from './disk'

const { result_dialog } = dialog
const { has_disk, get_disk, set_disk, unset_disk } = disk

const _file_list_directory = async (path) => {
  const item = get_disk(path)
  const result = []

  for (const child in item) {
    if (item[child] == null) {
      result.push({ name: child, mime: 'text/plain', directory: false })
    } else {
      result.push({ name: child, mime: 'text/plain', directory: true })
    }
  }

  return result
}

const _file_is_directory = async (path) => {
  const item = get_disk(path)
  return item != null
}

const _file_exists = async (path) => {
  return has_disk(path)
}

const _file_contents = async (path) => {
  if (!has_disk(path)) {
    return
  }

  const item = get_disk(path)

  if (item !== null) {
    return item
  }

  const content = disk.get_content()
  if (content == null) {
    return `File "${path}" contents`
  }

  return content
}

const _file_create = async (path) => {
  if (has_disk(path)) {
    return false
  }

  set_disk(path, null)
  return has_disk(path)
}

const _file_create_directory = async (path) => {
  if (has_disk(path)) {
    return false
  }

  set_disk(path, {})
  return has_disk(path)
}

const _file_delete = async (path) => {
  if (!has_disk(path)) {
    return false
  }

  unset_disk(path)
  return !has_disk(path)
}

const _file_rename = async (path, proposed) => {
  if (!has_disk(path)) {
    return false
  }

  const value = get_disk(path)
  unset_disk(path)
  set_disk(proposed, value)
  return !has_disk(path) && has_disk(proposed)
}

const _file_write = async (path, value) => {
  set_disk(path, value)
  return true
}

const _file_write_library = async (path, files) => {
  set_disk(path, files.join('\n'))
  return true
}

const _directory_list = async (path) => {
  const item = get_disk(path)

  if (!item) {
    return []
  }

  const keys = Object.keys(item)
  return keys
}

const _select_directory = async () => {
  return result_dialog()
}

const _search_next_result = {
  path: {
    absolute: '/project/path',
    relative: 'path',
    matched: true
  },
  directory: false,
  matches: []
}

export default {
  file: {
    subscribe: jest.fn(),
    clear_subscriptions: jest.fn(),
    contents: jest.fn(_file_contents),
    create: jest.fn(_file_create),
    create_directory: jest.fn(_file_create_directory),
    exists: jest.fn(_file_exists),
    delete: jest.fn(_file_delete),
    is_directory: jest.fn(_file_is_directory),
    list_directory: jest.fn(_file_list_directory),
    rename: jest.fn(_file_rename),
    open: jest.fn(),
    write: jest.fn(_file_write),
    write_library: jest.fn(_file_write_library),
    directory_list: jest.fn(_directory_list),
    select_directory: jest.fn(_select_directory),
    search_path: jest.fn(),
    search_next: jest.fn().mockReturnValue({ path: null }).mockReturnValueOnce(_search_next_result)
  }
}
