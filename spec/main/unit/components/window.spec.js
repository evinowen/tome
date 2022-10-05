const { cloneDeep } = require('lodash')
const electron = require('electron')
const _component = require('@/components/window')
const preload = require('@/components/window/preload')

let ipcMainMap

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn() },
  ipcRenderer: { invoke: jest.fn() }
}))

electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

describe('components/window', () => {
  let component
  let win

  beforeEach(() => {
    ipcMainMap = new Map()

    win = {
      isMaximized: jest.fn(() => true),
      minimize: jest.fn(),
      maximize: jest.fn(),
      restore: jest.fn(),
      close: jest.fn()
    }

    component = cloneDeep(_component)
    component.register(win)
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
