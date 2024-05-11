import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { cloneDeep } from 'lodash'
import _component from '@/components/window'
import { window as preload } from '@/preload'
import * as electron_meta from '?/meta/electron'
import * as electron_mock from '?/mocks/electron'

jest.doMock('electron', () => electron_mock)

describe('components/window', () => {
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

  it('should return maximized state upon call to is_maximized', async () => {
    await preload.is_maximized()

    expect(win.isMaximized).toHaveBeenCalled()
  })

  it('should call for window to minimize upon call to minimize', async () => {
    await preload.minimize()

    expect(win.minimize).toHaveBeenCalled()
  })

  it('should call for window to maximize upon call to maximize', async () => {
    await preload.maximize()

    expect(win.maximize).toHaveBeenCalled()
  })

  it('should call for window to restore upon call to restore', async () => {
    await preload.restore()

    expect(win.restore).toHaveBeenCalled()
  })

  it('should call for window to close upon call to close', async () => {
    await preload.close()

    expect(win.close).toHaveBeenCalled()
  })
})
