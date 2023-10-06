import { cloneDeep } from 'lodash'
import * as electron from 'electron'
import * as fs from 'node:fs'
import * as path from 'node:path'
import helpers from '../../helpers'
import _component from '@/components/clipboard'
import preload from '@/components/clipboard/preload'

let ipcMainMap
const { optional, random_string, expect_call_parameters_to_return } = helpers(expect)

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
    removeHandler: jest.fn()
  },
  ipcRenderer: { invoke: jest.fn() },
  clipboard: {
    writeText: jest.fn(),
    readText: jest.fn()
  }
}))

const mocked_electron = jest.mocked(electron)
mocked_electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
mocked_electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

jest.mock('node:fs', () => ({
  access: jest.fn(),
  lstat: jest.fn(),
  rename: jest.fn(),
  copyFile: jest.fn()
}))

const fs_lstat_return = {
  isDirectory: jest.fn(() => false)
}

let error: Error
const mocked_fs = jest.mocked(fs)
mocked_fs.access.mockImplementation((path, callback) => callback(new Error('Mock Error')))
mocked_fs.lstat.mockImplementation((path, options?, callback?) => optional(options, callback)(error, fs_lstat_return))
mocked_fs.rename.mockImplementation((target, destination, callback?) => callback(error))
mocked_fs.copyFile.mockImplementation((target, destination, mode?, callback?) => optional(mode, callback)(error))

jest.mock('node:path', () => ({
  basename: jest.fn(),
  dirname: jest.fn(),
  parse: jest.fn(),
  join: jest.fn()
}))

const mocked_path = jest.mocked(path)
mocked_path.basename.mockImplementation(() => random_string(16, true))
mocked_path.dirname.mockImplementation(() => random_string(16, true))
mocked_path.parse.mockImplementation(() => ({ name: random_string(), base: random_string(), ext: random_string(), root: random_string(), dir: random_string() }))
mocked_path.join.mockImplementation((...input) => input.join('/'))

describe('components/clipboard', () => {
  let component

  beforeEach(() => {
    ipcMainMap = new Map()
    component = cloneDeep(_component)
    component.register()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call to write text to clipboard upon call to writetext', async () => {
    const text = 'text'
    await preload.writetext(text)

    expect_call_parameters_to_return(electron.clipboard.writeText, [text])
  })

  it('should call for and return clipboard text upon call to readtext', async () => {
    const result = await preload.readtext()

    expect_call_parameters_to_return(electron.clipboard.readText, [], result)
  })

  it('should rename source upon call to paste as cut', async () => {
    mocked_fs.access.mockImplementationOnce((path, mode?, callback?) => optional(mode, callback)())

    const action = 'cut'
    const source = '/file.start.md'
    const target = '/file.end.md'

    await preload.paste(action, source, target)

    expect(fs.copyFile).not.toHaveBeenCalled()
    expect(fs.rename).toHaveBeenCalled()
  })

  it('should copy source upon call to paste as copy', async () => {
    mocked_fs.access.mockImplementationOnce((path, mode?, callback?) => optional(mode, callback)())

    const action = 'copy'
    const source = '/file.start.md'
    const target = '/file.end.md'

    await preload.paste(action, source, target)

    expect(fs.copyFile).toHaveBeenCalled()
    expect(fs.rename).not.toHaveBeenCalled()
  })

  it('should throw error destination does not exist upon call to paste', async () => {
    let stats: fs.Stats
    mocked_fs.lstat.mockImplementationOnce((path, options?, callback?) => optional(options, callback)(new Error('Mock Error'), stats))

    const action = 'copy'
    const source = '/project'
    const target = '/project'

    await expect(preload.paste(action, source, target)).rejects.toBeDefined()

    expect(fs.copyFile).not.toHaveBeenCalled()
    expect(fs.rename).not.toHaveBeenCalled()
  })

  it('should throw error when source and destination match upon call to paste', async () => {
    mocked_path.dirname.mockImplementationOnce((path) => path)
    fs_lstat_return.isDirectory.mockImplementationOnce(() => true)

    const action = 'copy'
    const source = '/project'
    const target = '/project'

    await expect(preload.paste(action, source, target)).rejects.toBeDefined()

    expect(fs.copyFile).not.toHaveBeenCalled()
    expect(fs.rename).not.toHaveBeenCalled()
  })
})
