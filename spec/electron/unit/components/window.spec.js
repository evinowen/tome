const { cloneDeep } = require('lodash')
const electron = require('electron')
const _component = require('@/../electron/components/window')
const preload = require('@/../electron/components/window/preload')

let ipcMainMap

jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn() },
  ipcRenderer: { invoke: jest.fn() }
}))

electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

describe('WindowComponent', () => {
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

  it('should return maximized state upon call to is_window_maximized', async () => {
    await preload.is_window_maximized()

    expect(win.isMaximized).toHaveBeenCalled()
  })

  it('should call for window to minimize upon call to minimize_window', async () => {
    await preload.minimize_window()

    expect(win.minimize).toHaveBeenCalled()
  })

  it('should call for window to maximize upon call to maximize_window', async () => {
    await preload.maximize_window()

    expect(win.maximize).toHaveBeenCalled()
  })

  it('should call for window to restore upon call to restore_window', async () => {
    await preload.restore_window()

    expect(win.restore).toHaveBeenCalled()
  })

  it('should call for window to close upon call to close_window', async () => {
    await preload.close_window()

    expect(win.close).toHaveBeenCalled()
  })
})
