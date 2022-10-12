const { cloneDeep } = require('lodash')
const electron = require('electron')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { random_string } = require('?/helpers')(expect)
const _component = require('@/components/actions')
const preload = require('@/components/actions/preload')

let ipcMainMap

const { environment } = _component.data()
environment.require = jest.fn()
environment.require.resolve = jest.fn(() => 'example')

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn() },
  ipcRenderer: { invoke: jest.fn() }
}))

electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

jest.mock('node:fs', () => ({
  lstat: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn()
}))

const fs_lstat_return = {
  isDirectory: jest.fn(() => true)
}

const optional = (first, second) => second || first

fs.lstat.mockImplementation((path, callback) => callback(undefined, fs_lstat_return))
fs.readFile.mockImplementation((target, encoding, callback) => callback(undefined, random_string(128)))
fs.writeFile.mockImplementation((target, content, encoding, callback) => optional(encoding, callback)())

jest.mock('node:path', () => ({
  join: jest.fn()
}))

path.join.mockImplementation((...input) => input.join('/'))

let vm_script_success = true

const vm_script = {
  runInNewContext: jest.fn((context) => {
    const { require, resolve, content } = context

    const input = 'Test Content'
    content(input)
    content()

    if (!vm_script_success) {
      throw new Error('Mock Error')
    }

    require('example')

    resolve(true)
  })
}

jest.mock('node:vm', () => ({
  Script: jest.fn()
}))

vm.Script.mockImplementation(() => vm_script)


describe('components/actions', () => {
  let component

  beforeEach(() => {
    ipcMainMap = new Map()
    vm_script_success = true

    component = cloneDeep(_component)
    component.register()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should find and invoke action upon call to invoke', async () => {
    const name = 'action'

    const result = await preload.invoke(name)

    expect(result.success).toBeTruthy()
  })

  it('should find and invoke action but return error on exception upon call to invoke', async () => {
    vm_script_success = false

    const name = 'action'

    const result = await preload.invoke(name)

    expect(result.success).toBeFalsy()
  })
})
