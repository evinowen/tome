import electron from 'electron'

jest.mock('@/../electron/components/actions', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/../electron/components/clipboard', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/../electron/components/file', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/../electron/components/git', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/../electron/components/metadata', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/../electron/components/path', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/../electron/components/ssl', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/../electron/components/templates', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/../electron/components/window', () => ({ register: jest.fn(), data: jest.fn() }))

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  app: {},
  BrowserWindow: jest.fn(),
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn()
  },
}))


let app_run
electron.app.on = jest.fn(async (type, callback) => {
  if (!app_run.includes(type)) {
    return
  }

  await callback()
})

electron.app.quit = jest.fn()
electron.app.whenReady = jest.fn(() => Promise.resolve())

const win_run_skip = new Set(['closed'])
const win = {
  loadFile: jest.fn(),
  loadURL: jest.fn(),
  show: jest.fn(),
  webContents: {
    openDevTools: jest.fn()
  }
}

win.on = jest.fn(async (type, callback) => {
  if (win_run_skip.has(type)) {
    return
  }

  await callback()
})

electron.BrowserWindow.mockImplementation((options) => {
  if (options.webPreferences.preload) {
    require(options.webPreferences.preload)
  }

  return win
})
electron.BrowserWindow.getAllWindows = jest.fn(() => [])

describe('ElectronMain', () => {
  const _platform = process.platform
  const _environment = process.env

  beforeEach(() => {
    app_run = ['ready']

    process.env.NODE_ENV = 'production'
    delete process.env.FRAME_WINDOW
  })

  afterEach(() => {
    process.env = _environment
    Object.defineProperty(process, 'platform', { value: _platform })

    jest.clearAllMocks()
  })

  it('should construct the window on ready', async () => {
    expect(electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/../electron/main') })
    await promise

    expect(electron.app.on).toHaveBeenCalled()
    expect(win.loadFile).toHaveBeenCalled()
  })

  it('should construct the window on ready with development flag', async () => {
    process.env.NODE_ENV = 'development'

    expect(electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/../electron/main') })
    await promise

    expect(electron.app.on).toHaveBeenCalled()
    expect(win.loadFile).not.toHaveBeenCalled()
    expect(win.loadURL).toHaveBeenCalled()
  })

  it('should construct the window on ready with frame flag', async () => {
    process.env.FRAME_WINDOW = 'true'

    expect(electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/../electron/main') })
    await promise

    expect(electron.app.on).toHaveBeenCalled()
    expect(win.loadFile).toHaveBeenCalled()
  })

  it('should construct the window on activate', async () => {
    app_run = ['activate']
    expect(electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/../electron/main') })
    await promise

    expect(electron.app.on).toHaveBeenCalled()
    expect(win.loadFile).toHaveBeenCalled()
  })

  it('should construct the window on activate', async () => {
    app_run = ['activate']
    expect(electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/../electron/main') })
    await promise

    expect(electron.app.on).toHaveBeenCalled()
    expect(win.loadFile).toHaveBeenCalled()
  })

  it('should exit on all window closed event', async () => {
    app_run = ['window-all-closed']
    expect(electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/../electron/main') })
    await promise

    expect(electron.app.on).toHaveBeenCalled()

    if (process.platform !== 'darwin') {
      expect(electron.app.quit).toHaveBeenCalled()
    }
  })
})
