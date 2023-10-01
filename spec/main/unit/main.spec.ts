import { cloneDeep } from 'lodash'
import { expect, jest, describe } from '@jest/globals'
import * as electron from 'electron'
const { BrowserWindow } = electron

jest.mock('@/components/actions', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/clipboard', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/file', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/repository', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/metadata', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/path', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/ssl', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/templates', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/window', () => ({ default: { register: jest.fn(), data: jest.fn() } }))

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn(), catchErrors: jest.fn() }))
jest.mock('electron', () => ({
  app: {
    on: jest.fn(),
    whenReady: jest.fn(() => Promise.resolve()),
    quit: jest.fn()
  },
  BrowserWindow: jest.fn(() => ({
    loadFile: jest.fn(),
    loadURL: jest.fn(),
    show: jest.fn()
  })),
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    removeHandler: jest.fn()
  },
}))

jest.mock('node:path', () => ({
  join: jest.fn()
}))

let app_run
const mocked_electron = jest.mocked(electron)
const mocked_BrowserWindow = mocked_electron.BrowserWindow as jest.MockedClass<typeof BrowserWindow>
const mocked_window = new mocked_BrowserWindow
mocked_BrowserWindow.mockImplementation((options) => {
  if (options.webPreferences.preload) {
    require(options.webPreferences.preload)
  }

  return mocked_window
})

describe('main', () => {
  const _platform = cloneDeep(process.platform)
  const _environment = cloneDeep(process.env)

  beforeEach(() => {
    app_run = ['ready']

    jest.spyOn(mocked_electron.app, 'on').mockImplementation((event: string, callback: (app: Electron.App) => Electron.App) => {
      if (app_run.includes(event)) {
        callback(this as Electron.App)
      }

      return mocked_electron.app
    })

    Object.defineProperty(process, 'env', { value: cloneDeep(_environment) })
    Object.defineProperty(process, 'platform', { value: cloneDeep(_platform) })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should construct the window on ready', async () => {
    expect(mocked_electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/main') })
    await promise

    expect(mocked_electron.app.on).toHaveBeenCalled()
    expect(mocked_window.loadFile).toHaveBeenCalled()
  })

  it('should construct the window on ready with development flag', async () => {
    process.env.NODE_ENV = 'development'

    expect(mocked_electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/main') })
    await promise

    expect(mocked_electron.app.on).toHaveBeenCalled()
    expect(mocked_window.loadFile).not.toHaveBeenCalled()
    expect(mocked_window.loadURL).toHaveBeenCalled()
  })

  it('should construct the window on ready with frame flag', async () => {
    process.env.FRAME_WINDOW = 'true'

    expect(mocked_electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/main') })
    await promise

    expect(mocked_electron.app.on).toHaveBeenCalled()
    expect(mocked_window.loadFile).toHaveBeenCalled()
  })

  it('should construct the window on activate', async () => {
    app_run = ['activate']
    expect(mocked_electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/main') })
    await promise

    expect(mocked_electron.app.on).toHaveBeenCalled()
    expect(mocked_window.loadFile).toHaveBeenCalled()
  })

  it('should construct the window on activate', async () => {
    app_run = ['activate']
    expect(mocked_electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/main') })
    await promise

    expect(mocked_electron.app.on).toHaveBeenCalled()
    expect(mocked_window.loadFile).toHaveBeenCalled()
  })

  it('should exit on all window closed event', async () => {
    app_run = ['window-all-closed']
    expect(mocked_electron.app.on).toHaveBeenCalledTimes(0)

    let promise
    jest.isolateModules(() => { promise = require('@/main') })
    await promise

    expect(mocked_electron.app.on).toHaveBeenCalled()

    if (process.platform !== 'darwin') {
      expect(mocked_electron.app.quit).toHaveBeenCalled()
    }
  })
})
