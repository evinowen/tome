import { file } from '../support/disk'
import meta from '../../meta/node/fs'

const optional = (first, second) => second || first

export const access = jest.fn((target, callback?) => callback(meta.get_disk().has_disk(target) ? undefined : new Error('Mock Error')))
export const copyFile = jest.fn((target, destination, mode?, callback?) => meta.get_disk().set_disk(destination, meta.get_disk().get_disk(target)) || optional(mode, callback)())
export const lstat = jest.fn((target, options?, callback?) => { optional(options, callback)(undefined, meta.lstat_return(target)) })
export const mkdir = jest.fn((target, callback?) => { meta.get_disk().set_disk(target, file({})) || callback(undefined, meta.lstat_return(target)) })
export const rename = jest.fn((target, destination, callback) => meta.get_disk().set_disk(destination, meta.get_disk().get_disk(target)) || meta.get_disk().unset_disk(target) || callback())
export const readdir = jest.fn((target, options?, callback?) => optional(options, callback)(undefined, meta.readdir_files(target, callback ? options : {})))
export const readFile = jest.fn((target, options?, callback?) => optional(options, callback)(undefined, meta.get_disk().get_content(target)))
export const writeFile = jest.fn((target, content, options?, callback?) => meta.get_disk().set_disk(target) || meta.get_disk().set_content(target, content) || optional(options, callback)())
export const unlink = jest.fn((target, callback?) => meta.get_disk().unset_disk(target) || callback())
