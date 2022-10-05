const { cloneDeep } = require('lodash')
const electron = require('electron')
const fs = require('fs')
const path = require('path')
const { random_string, expect_call_parameters_to_return } = require('?/helpers')(expect)
const _component = require('@/components/clipboard')
const preload = require('@/components/clipboard/preload')

let ipcMainMap

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn() },
  ipcRenderer: { invoke: jest.fn() },
  clipboard: {
    writeText: jest.fn(),
    readText: jest.fn()
  }
}))

electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

jest.mock('fs', () => ({
  access: jest.fn(),
  lstat: jest.fn(),
  rename: jest.fn(),
  copyFile: jest.fn()
}))

const fs_lstat_return = {
  isDirectory: jest.fn(() => false)
}

fs.access.mockImplementation((path, callback) => callback(new Error('Mock Error')))
fs.lstat.mockImplementation((path, callback) => callback(null, fs_lstat_return))
fs.rename.mockImplementation((target, destination, callback) => callback(null))
fs.copyFile.mockImplementation((target, destination, mode, callback) => callback(null))

jest.mock('path', () => ({
  basename: jest.fn(),
  dirname: jest.fn(),
  parse: jest.fn(),
  join: jest.fn()
}))

path.basename.mockImplementation(() => random_string(16, true))
path.dirname.mockImplementation(() => random_string(16, true))
path.parse.mockImplementation(() => ({ name: random_string(), ext: random_string() }))
path.join.mockImplementation((...input) => input.join('/'))

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

    expect_call_parameters_to_return(electron.clipboard.writeText, [text], undefined)
  })

  it('should call for and return clipboard text upon call to readtext', async () => {
    const result = await preload.readtext()

    expect_call_parameters_to_return(electron.clipboard.readText, [], result)
  })

  it('should rename source upon call to paste as cut', async () => {
    fs.access.mockImplementationOnce((path, callback) => callback())

    const action = 'cut'
    const source = '/file.start.md'
    const target = '/file.end.md'

    await preload.paste(action, source, target)

    expect(fs.copyFile).not.toHaveBeenCalled()
    expect(fs.rename).toHaveBeenCalled()
  })

  it('should copy source upon call to paste as copy', async () => {
    fs.access.mockImplementationOnce((path, callback) => callback())

    const action = 'copy'
    const source = '/file.start.md'
    const target = '/file.end.md'

    await preload.paste(action, source, target)

    expect(fs.copyFile).toHaveBeenCalled()
    expect(fs.rename).not.toHaveBeenCalled()
  })

  it('should throw error destination does not exist upon call to paste', async () => {
    fs.lstat.mockImplementationOnce((path, callback) => callback(new Error('Mock Error')))

    const action = 'copy'
    const source = '/project'
    const target = '/project'

    await expect(preload.paste(action, source, target)).rejects.toBeDefined()

    expect(fs.copyFile).not.toHaveBeenCalled()
    expect(fs.rename).not.toHaveBeenCalled()
  })

  it('should throw error when source and destination match upon call to paste', async () => {
    path.dirname.mockImplementationOnce((path) => path)
    fs_lstat_return.isDirectory.mockImplementationOnce(() => true)

    const action = 'copy'
    const source = '/project'
    const target = '/project'

    await expect(preload.paste(action, source, target)).rejects.toBeDefined()

    expect(fs.copyFile).not.toHaveBeenCalled()
    expect(fs.rename).not.toHaveBeenCalled()
  })
})
