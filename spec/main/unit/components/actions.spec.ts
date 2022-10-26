import { cloneDeep } from 'lodash'
import * as electron from 'electron'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as vm from 'node:vm'
import helpers from '../../helpers'
import _component from '@/components/actions'
import preload from '@/components/actions/preload'

let ipcMainMap

const { random_string } = helpers(expect)
const { environment } = _component.data()

jest.spyOn(environment, 'require').mockImplementation(() => ({ resolve: jest.fn() }))
jest.spyOn(environment, 'resolve').mockImplementation(() => ({ resolve: jest.fn() }))

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn() },
  ipcRenderer: { invoke: jest.fn() }
}))

const mocked_electron = jest.mocked(electron)
mocked_electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
mocked_electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

jest.mock('node:fs', () => ({
  lstat: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn()
}))

const fs_lstat_return = {
  isDirectory: jest.fn(() => true)
}

const optional = (first, second) => second || first

const mocked_fs = jest.mocked(fs)
mocked_fs.lstat.mockImplementation((path, options?, callback?) => optional(options, callback)(undefined, fs_lstat_return))
mocked_fs.readFile.mockImplementation((target, options?, callback?) => optional(options, callback)(undefined, random_string(128)))
mocked_fs.writeFile.mockImplementation((target, content, encoding?, callback?) => optional(encoding, callback)())

jest.mock('node:path', () => ({
  join: jest.fn()
}))

const mocked_path = jest.mocked(path)
mocked_path.join.mockImplementation((...input) => input.join('/'))

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
} as unknown as vm.Script

jest.mock('node:vm', () => ({
  Script: jest.fn()
}))

const mocked_vm = jest.mocked(vm)
mocked_vm.Script.mockImplementation(() => vm_script)

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
