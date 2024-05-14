import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { cloneDeep } from 'lodash'
import _component from '@/components/log'
import { log as preload } from '@/preload'
import * as electron_meta from '?/meta/electron'
import * as electron_mock from '?/mocks/electron'

jest.doMock('electron', () => electron_mock)

describe('components/log', () => {
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

  it('should send log message to log trace upon call to trace', async () => {
    const message = 'Example Log'
    await preload.trace(message)

    expect(log.trace).toHaveBeenCalledWith(message)
  })

  it('should send log message to log debug upon call to debug', async () => {
    const message = 'Example Log'
    await preload.debug(message)

    expect(log.debug).toHaveBeenCalledWith(message)
  })

  it('should send log message to log info upon call to info', async () => {
    const message = 'Example Log'
    await preload.info(message)

    expect(log.info).toHaveBeenCalledWith(message)
  })

  it('should send log message to log warn upon call to warn', async () => {
    const message = 'Example Log'
    await preload.warn(message)

    expect(log.warn).toHaveBeenCalledWith(message)
  })

  it('should send log message to log error upon call to error', async () => {
    const message = 'Example Log'
    await preload.error(message)

    expect(log.error).toHaveBeenCalledWith(message)
  })

  it('should send log message to log fatal upon call to fatal', async () => {
    const message = 'Example Log'
    await preload.fatal(message)

    expect(log.fatal).toHaveBeenCalledWith(message)
  })
})
