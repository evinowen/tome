const disk = require("./support/disk")
const path = require("./path")

const lstat_return = (target) => {
  if (!disk.has_disk(target)) {
    return
  }

  const node = disk.get_disk(target)
  const directory = node !== undefined

  return {
    name: path.basename(target),
    isDirectory: jest.fn(() => directory),
    isFile: jest.fn(() => !directory)
  }
}

const readdir_files = (target, options) => {
  if (!disk.has_disk(target)) {
    return
  }

  let output = 'names'
  if (options.withFileTypes === true) {
    output = 'objects'
  }

  const node = disk.get_disk(target)
  const files = []
  for (const item in node) {
    const directory = node[item] !== undefined
    files.push(
      output === 'names'
      ? item
      : {
        name: item,
        isDirectory: jest.fn(() => directory),
        isFile: jest.fn(() => !directory)
      }
    )
  }

  return files
}

const optional = (first, second) => second || first

module.exports = {
  _: {
    lstat_return,
    readdir_files
  },
  access: jest.fn((target, callback) => callback(disk.has_disk(target) ? undefined : new Error('Mock Error'))),
  copyFile: jest.fn((target, destination, mode, callback) => disk.set_disk(destination, disk.get_disk(target)) || optional(mode, callback)()),
  lstat: jest.fn((target, callback) => callback(undefined, lstat_return(target))),
  mkdir: jest.fn((target, callback) => disk.set_disk(target, []) || callback(undefined, lstat_return(target))),
  rename: jest.fn((target, destination, callback) => disk.set_disk(destination, disk.get_disk(target)) || disk.unset_disk(target) || callback()),
  readdir: jest.fn((target, options, callback) => optional(options, callback)(undefined, readdir_files(target, callback ? options : {}))),
  readFile: jest.fn((target, encoding, callback) => callback(undefined, disk.get_content(target))),
  writeFile: jest.fn((target, content, encoding, callback) => disk.set_disk(target, ) || disk.set_content(target, content) || optional(encoding, callback)()),
  unlink: jest.fn((target, callback) => disk.unset_disk(target) || callback()),
}
