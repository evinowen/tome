import Disk, { split } from '../../mocks/support/disk'

let disk: Disk

const set_disk = (_disk: Disk) => { disk = _disk }
const get_disk = () => disk

const lstat_return = (target) => {
  if (!disk.has_disk(target)) {
    return
  }

  const node = disk.get_disk(target)

  const value = {
    name: split(target).pop(),
    isDirectory: jest.fn(() => node.directory),
    isFile: jest.fn(() => !node.directory)
  }

  return value
}

const readdir_files = (target, options) => {
  if (!disk.has_disk(target)) {
    return
  }

  const with_file_type = options?.withFileTypes || false

  const node = disk.get_disk(target)
  const files = []
  if (!node.directory) {
    return
  }

  for (const [name, file] of node.children) {
    files.push(
      with_file_type
      ? {
          name,
          isDirectory: jest.fn(() => file.directory),
          isFile: jest.fn(() => !file.directory)
        }
      : name
    )
  }

  return files
}

export default {
  set_disk,
  get_disk,
  lstat_return,
  readdir_files
}
