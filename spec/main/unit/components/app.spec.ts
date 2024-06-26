import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { cloneDeep } from 'lodash'
import * as electron from 'electron'
import helpers from '../../helpers'
import _component from '@/components/app'
import { app as preload } from '@/preload'
import * as electron_meta from '?/meta/electron'
import * as electron_mock from '?/mocks/electron'

jest.doMock('electron', () => electron_mock)

const { expect_call_parameters_to_return } = helpers(expect)

describe('components/app', () => {
  let component
  let win
  let log

  beforeEach(() => {
    electron_meta.ipc_reset()

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

  it('should call for and return application path of target upon call to getPath', async () => {
    const target = 'main'
    const result = await preload.getPath(target)

    expect_call_parameters_to_return(electron.app.getPath, [ target ], result)
  })

  it('should return process version upon call to getPath', async () => {
    const result = await preload.getVersion()

    expect(result).toBe(process.env.npm_package_version)
  })

  it('should return process data upon call to getProcess', async () => {
    const result = await preload.getProcess()

    expect(result).not.toBeUndefined()
  })
})
