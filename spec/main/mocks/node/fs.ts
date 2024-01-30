/* eslint-disable unicorn/prevent-abbreviations */
import { jest } from '@jest/globals'
import { NoParamCallback, Stats, Dirent } from 'node:fs'
import { file } from '../support/disk'
import meta from '../../meta/node/fs'

type DataParamCallback = (err: NodeJS.ErrnoException, data?: string) => void
type PathParamCallback = (err: NodeJS.ErrnoException, path?: string) => void
type StatsParamCallback = (err: NodeJS.ErrnoException | null, stats?: Stats) => void

type StringFilesArrayParamCallback = (err: NodeJS.ErrnoException, files: string[]) => void
type DirentFilesArrayParamCallback = (err: NodeJS.ErrnoException, files: Dirent[]) => void

export const access = jest.fn((path: string, callback: NoParamCallback): void => {
  let error: NodeJS.ErrnoException = undefined

  if (!meta.get_disk().has_disk(path)) {
    error = new Error(`Mock Error: !Disk.has_disk(path) - path: ${path}`)
  }

  callback(error)
})

export const copyFile = jest.fn((src: string, dest: string, callback: NoParamCallback): void => {
  const disk = meta.get_disk()
  let error: NodeJS.ErrnoException

  if (!disk.has_disk(src)) {
    error = new Error(`Mock Error: !Disk.has_disk(src) - src: ${src}`)
  }

  disk.set_disk(dest, disk.get_disk(src))

  callback(error)
})

export const lstat = jest.fn((path, callback: StatsParamCallback) => {
  const disk = meta.get_disk()
  let error: NodeJS.ErrnoException

  if (!disk.has_disk(path)) {
    error = new Error(`Mock Error: !Disk.has_disk(path) - src: ${path}`)
  }

  callback(error, error ? {} as Stats : meta.lstat_return(path))
})

export const mkdir = jest.fn((target, callback: PathParamCallback) => {
  const disk = meta.get_disk()
  let error: NodeJS.ErrnoException

  disk.set_disk(target, file({}))

  callback(error)
})

export const rename = jest.fn((oldPath, newPath, callback: NoParamCallback) => {
  const disk = meta.get_disk()
  let error: NodeJS.ErrnoException

  disk.set_disk(newPath, disk.get_disk(oldPath))
  disk.unset_disk(oldPath)

  callback(error)
})

type ReadDirOptions = {
  withFileTypes: true
}

export const readdir = jest.fn((target, ...options_and_callback: (ReadDirOptions | StringFilesArrayParamCallback | DirentFilesArrayParamCallback)[]) => {
  let error: NodeJS.ErrnoException

  if (options_and_callback.length === 2) {
    const [ , callback ] = options_and_callback as [ReadDirOptions, DirentFilesArrayParamCallback]
    const files = meta.readdir_files_dirents(target)

    callback(error, files)
  } else {
    const [ callback ] = options_and_callback as [ StringFilesArrayParamCallback ]
    const files = meta.readdir_files_strings(target)

    callback(error, files)
  }
})

export const readFile = jest.fn((path: string, options: 'utf8', callback: DataParamCallback): void => {
  let error: NodeJS.ErrnoException
  let data = ''

  if (meta.get_disk().has_disk(path)) {
    data = meta.get_disk().get_content(path)
  } else {
    error = new Error(`Mock Error: !Disk.has_disk(path) - path: ${path}`)
  }

  callback(error, data)
})

export const writeFile = jest.fn((file, data, callback: NoParamCallback) => {
  const disk = meta.get_disk()
  let error: NodeJS.ErrnoException

  disk.set_disk(file)
  disk.set_content(file, data)

  callback(error)
})

export const unlink = jest.fn((path, callback: NoParamCallback) => {
  const disk = meta.get_disk()
  let error: NodeJS.ErrnoException

  disk.unset_disk(path)

  callback(error)
})
