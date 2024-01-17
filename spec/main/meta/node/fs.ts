import { jest } from '@jest/globals'
import { Stats } from 'node:fs'
import Disk, { split } from '../../mocks/support/disk'

let disk: Disk

const set_disk = (_disk: Disk) => { disk = _disk }
const get_disk = () => disk

const lstat_return = (target): Stats => {
  if (!disk.has_disk(target)) {
    return {} as Stats
  }

  const node = disk.get_disk(target)

  const value = {
    name: split(target).pop(),
    isDirectory: jest.fn(() => node.directory),
    isFile: jest.fn(() => !node.directory)
  } as unknown as Stats

  return value
}

const readdir_files_strings = (target) => {
  if (!disk.has_disk(target)) {
    return
  }

  const node = disk.get_disk(target)
  const files = []
  if (!node.directory) {
    return
  }

  for (const [name] of node.children) {
    files.push(name)
  }

  return files
}

const readdir_files_dirents = (target) => {
  if (!disk.has_disk(target)) {
    return
  }

  const node = disk.get_disk(target)
  const files = []
  if (!node.directory) {
    return
  }

  for (const [name, file] of node.children) {
    files.push({
      name,
      isDirectory: jest.fn(() => file.directory),
      isFile: jest.fn(() => !file.directory)
    })
  }

  return files
}

export default {
  set_disk,
  get_disk,
  lstat_return,
  readdir_files_strings,
  readdir_files_dirents,
}
