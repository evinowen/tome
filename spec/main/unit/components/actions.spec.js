const { cloneDeep } = require('lodash')
const electron = require('electron')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
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

jest.mock('fs', () => ({
  lstat: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn()
}))

const fs_lstat_return = {
  isDirectory: jest.fn(() => true)
}

const optional = (first, second) => second ? second : first

fs.lstat.mockImplementation((path, callback) => callback(null, fs_lstat_return))
fs.readFile.mockImplementation((target, encoding, callback) => callback(null, random_string(128)))
fs.writeFile.mockImplementation((target, content, encoding, callback) => optional(encoding, callback)(null))

jest.mock('path', () => ({
  join: jest.fn()
}))

path.join.mockImplementation((...input) => input.join('/'))

let vm_script_success = true

const vm_script = {
  runInNewContext: jest.fn((context, options) => {
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

jest.mock('vm', () => ({
  createScript: jest.fn()
}))

vm.createScript.mockImplementation(() => vm_script)


describe('ActionsComponent', () => {
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

  it('should find and invoke action upon call to action_invoke', async () => {
    const name = 'action'

    const result = await preload.action_invoke(name)

    expect(result.success).toBeTruthy()
  })

  it('should find and invoke action but return error on exception upon call to action_invoke', async () => {
    vm_script_success = false

    const name = 'action'

    const result = await preload.action_invoke(name)

    expect(result.success).toBeFalsy()
  })
})
