import { app, protocol, BrowserWindow } from 'electron'

jest.mock('electron', () => ({ app: {}, protocol: {}, BrowserWindow: jest.fn() }))
jest.mock('vue-cli-plugin-electron-builder/lib', () => ({ createProtocol: jest.fn() }))

protocol.registerSchemesAsPrivileged = jest.fn()

let app_run

app.on = jest.fn(async (type, callback) => {
  if (app_run.indexOf(type) < 0) {
    return
  }
  await callback()
})

app.quit = jest.fn()

const win_run = ['closed']
const win = {
  loadURL: jest.fn(),
  webContents: {
    openDevTools: jest.fn()
  }
}

win.on = jest.fn(async (type, callback) => {
  if (win_run.indexOf(type) < 0) {
    return
  }
  await callback()
})

BrowserWindow.mockImplementation(() => win)

describe('background.js', () => {
  const _platform = process.platform
  const _env = process.env

  beforeEach(() => {
    app_run = ['ready']

    process.env.NODE_ENV = 'production'
  })

  afterEach(() => {
    process.env = _env
    Object.defineProperty(process, 'platform', { value: _platform })

    jest.clearAllMocks()
  })

  it('should construct the window on ready', () => {
    expect(app.on).toHaveBeenCalledTimes(0)

    jest.isolateModules(() => { require('@/background.js') })

    expect(app.on).toHaveBeenCalledTimes(3)
    expect(win.loadURL).toHaveBeenCalledTimes(1)
    expect(win.loadURL.mock.calls[0][0]).toBe('app://./index.html')
  })

  it('should open devtools when WEBPACK_DEV_SERVER_URL is used for setting the server URL', () => {
    process.env.NODE_ENV = 'development'
    process.env.WEBPACK_DEV_SERVER_URL = 'app://./dev/index.html'

    jest.isolateModules(() => { require('@/background.js') })

    expect(win.webContents.openDevTools).toHaveBeenCalledTimes(1)
  })

  it('should not open devtools when WEBPACK_DEV_SERVER_URL is used for setting the server URL when in test environment', () => {
    process.env.NODE_ENV = 'development'
    process.env.IS_TEST = true
    process.env.WEBPACK_DEV_SERVER_URL = 'app://./dev/index.html'

    jest.isolateModules(() => { require('@/background.js') })

    expect(win.webContents.openDevTools).toHaveBeenCalledTimes(0)
  })

  it('should construct the window on activate', () => {
    app_run = ['activate']
    expect(app.on).toHaveBeenCalledTimes(0)

    jest.isolateModules(() => { require('@/background.js') })

    expect(app.on).toHaveBeenCalledTimes(3)
    expect(win.loadURL).toHaveBeenCalledTimes(1)
  })

  it('should construct the window on activate', () => {
    app_run = ['activate']
    expect(app.on).toHaveBeenCalledTimes(0)

    jest.isolateModules(() => { require('@/background.js') })

    expect(app.on).toHaveBeenCalledTimes(3)
    expect(win.loadURL).toHaveBeenCalledTimes(1)
  })

  it('should exit on all window closed event', () => {
    app_run = ['window-all-closed']
    expect(app.on).toHaveBeenCalledTimes(0)

    jest.isolateModules(() => { require('@/background.js') })

    expect(app.on).toHaveBeenCalledTimes(3)
    expect(app.quit).toHaveBeenCalledTimes(1)
  })

  it('should supply appropriate listener for exit events while in win32 development mode', () => {
    process.env.NODE_ENV = 'development'
    Object.defineProperty(process, 'platform', { value: 'win32' })

    // callback_win32 for eslint compatability
    jest.spyOn(process, 'on').mockImplementationOnce((type, callback_win32) => {
      if (type === 'message') {
        callback_win32('graceful-exit')
      }
    })

    jest.isolateModules(() => { require('@/background.js') })

    expect(app.quit).toHaveBeenCalledTimes(1)
  })

  it('should supply appropriate listener for exit events while in linux development mode', () => {
    process.env.NODE_ENV = 'development'
    Object.defineProperty(process, 'platform', { value: 'linux' })

    jest.spyOn(process, 'on').mockImplementationOnce((type, callback) => {
      if (type === 'SIGTERM') {
        callback()
      }
    })

    jest.isolateModules(() => { require('@/background.js') })

    expect(app.quit).toHaveBeenCalledTimes(1)
  })
})
