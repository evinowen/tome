import { cloneDeep } from 'lodash'
import electron from 'electron'

jest.mock('@/components/actions', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/components/clipboard', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/components/file', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/components/repository', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/components/metadata', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/components/path', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/components/ssl', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/components/templates', () => ({ register: jest.fn(), data: jest.fn() }))
jest.mock('@/components/window', () => ({ register: jest.fn(), data: jest.fn() }))

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

jest.mock('node:path', () => ({
  join: jest.fn()
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

describe('main', () => {
  const _platform = cloneDeep(process.platform)
  const _environment = cloneDeep(process.env)

  beforeEach(() => {
    app_run = ['ready']

    Object.defineProperty(process, 'env', { value: cloneDeep(_environment) })
    Object.defineProperty(process, 'platform', { value: cloneDeep(_platform) })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should construct the window on ready', async () => {
    expect(electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/main') })
    await promise

    expect(electron.app.on).toHaveBeenCalled()
    expect(win.loadFile).toHaveBeenCalled()
  })

  it('should construct the window on ready with development flag', async () => {
    process.env.NODE_ENV = 'development'

    expect(electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/main') })
    await promise

    expect(electron.app.on).toHaveBeenCalled()
    expect(win.loadFile).not.toHaveBeenCalled()
    expect(win.loadURL).toHaveBeenCalled()
  })

  it('should construct the window on ready with frame flag', async () => {
    process.env.FRAME_WINDOW = 'true'

    expect(electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/main') })
    await promise

    expect(electron.app.on).toHaveBeenCalled()
    expect(win.loadFile).toHaveBeenCalled()
  })

  it('should construct the window on activate', async () => {
    app_run = ['activate']
    expect(electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/main') })
    await promise

    expect(electron.app.on).toHaveBeenCalled()
    expect(win.loadFile).toHaveBeenCalled()
  })

  it('should construct the window on activate', async () => {
    app_run = ['activate']
    expect(electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/main') })
    await promise

    expect(electron.app.on).toHaveBeenCalled()
    expect(win.loadFile).toHaveBeenCalled()
  })

  it('should exit on all window closed event', async () => {
    app_run = ['window-all-closed']
    expect(electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/main') })
    await promise

    expect(electron.app.on).toHaveBeenCalled()

    if (process.platform !== 'darwin') {
      expect(electron.app.quit).toHaveBeenCalled()
    }
  })
})
