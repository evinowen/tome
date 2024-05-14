import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { cloneDeep } from 'lodash'
import Disk from '../../mocks/support/disk'
import * as path from 'node:path'
import * as vm from 'node:vm'
import _component from '@/components/actions'
import { action as preload } from '@/preload'
import fs_meta from '../../meta/node/fs'
import * as fs_mock from '../../mocks/node/fs'
import * as electron_meta from '?/meta/electron'
import * as electron_mock from '?/mocks/electron'

jest.doMock('electron', () => electron_mock)
jest.doMock('node:fs', () => fs_mock)

const { environment } = _component.data()

jest.spyOn(environment, 'require').mockImplementation(() => ({ resolve: jest.fn() }))
jest.spyOn(environment, 'resolve').mockImplementation(() => ({ resolve: jest.fn() }))

jest.mock('node:path', () => ({
  join: jest.fn(),
}))

const mocked_path = jest.mocked(path)
mocked_path.join.mockImplementation((...input) => input.join('/'))

let vm_script_success = true

const vm_script_context_function = jest.fn((context: vm.Context) => {
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

const vm_script = {
  runInContext: vm_script_context_function,
  runInNewContext: vm_script_context_function,
} as unknown as jest.MockedObject<vm.Script>

jest.mock('node:vm', () => ({
  Script: jest.fn(),
}))

const mocked_vm = jest.mocked(vm)
mocked_vm.Script.mockImplementation(() => vm_script)

describe('components/actions', () => {
  let component
  let win
  let log

  const disk = new Disk()

  beforeEach(() => {
    electron_meta.ipc_reset()

    fs_meta.set_disk(disk)
    disk.reset_disk()

    vm_script_success = true

    win = {
      isMaximized: jest.fn(() => true),
      minimize: jest.fn(),
      maximize: jest.fn(),
      restore: jest.fn(),
      close: jest.fn(),
    }

    log = {
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
    }

    component = cloneDeep(_component)
    component.register(win, log)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should find and invoke action upon call to invoke', async () => {
    const source = '/project/.tome/actions/example.action.a'

    const result = await preload.invoke(source)

    expect(result.success).toBeTruthy()
  })

  it('should find and invoke action but return error on exception upon call to invoke', async () => {
    vm_script_success = false

    const source = '/project/.tome/actions/example.action.a'

    const result = await preload.invoke(source)

    expect(result.success).toBeFalsy()
  })
})
