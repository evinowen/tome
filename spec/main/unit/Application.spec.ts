import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { cloneDeep } from 'lodash'
import * as Electron from 'electron'
import LogFactory from '@/LogFactory'
import { once } from 'node:events'
import Application, { Events as ApplicationEvents } from '@/Application'

jest.mock('@/components/actions', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/app', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/clipboard', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/file', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/log', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/path', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/repository', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/ssl', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/templates', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/window', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/LogFactory', () => ({
  default: {
    build: jest.fn(() => ({
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
      silent: jest.fn(),
      flush: jest.fn(),
    })),
  },
}))

jest.mock('electron')

const mocked_log = jest.mocked(LogFactory)

jest.mock('node:path', () => ({
  join: jest.fn(),
}))

jest.mock('node:fs/promises', () => ({
  readdir: jest.fn(async () => []),
  stat: jest.fn(async () => ({
    isDirectory: jest.fn(() => false),
    mtime: new Date(),
  })),
  unlink: jest.fn(async () => {}),
}))

const mocked_electron_app = jest.mocked(Electron.app)
const mocked_BrowserWindow = jest.mocked(Electron.BrowserWindow)

describe('Application', () => {
  let app: Application
  const ElectronAppListeners = new Map<string, () => void>()

  function ExecElectronAppEvent (event) {
    const listener = ElectronAppListeners.get(event)

    if (listener === undefined) {
      throw new Error('Electron App Listener Not Found', event)
    }

    listener()
  }

  const _platform = cloneDeep(process.platform)
  const _environment = cloneDeep(process.env)

  beforeEach(() => {
    app = new Application()

    jest.spyOn(mocked_electron_app, 'on').mockImplementation((event: string, listener: () => void) => {
      ElectronAppListeners.set(event, listener)
      return mocked_electron_app
    })

    Object.defineProperty(process, 'env', { value: cloneDeep(_environment) })
    Object.defineProperty(process, 'platform', { value: cloneDeep(_platform) })
  })

  afterEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('should create application EventEmitter when initalized', async () => {
    await app.init()

    expect(app.emitter).not.toBeUndefined()
  })

  it('should create application Logger when initalized', async () => {
    await app.init()

    expect(app.log).not.toBeUndefined()
  })

  it('should build log from LogFactory on execute', async () => {
    expect(mocked_log.build).not.toHaveBeenCalled()

    await app.init()
    await app.execute()

    expect(mocked_log.build).toHaveBeenCalled()
  })

  it('should construct the window on ready', async () => {
    expect(app.window).toBeUndefined()

    await app.init()

    process.nextTick(() => app.execute())
    await once(app.emitter, ApplicationEvents.READY)

    expect(app.window).not.toBeUndefined()
  })

  it('should construct the window with file load on ready', async () => {
    process.env.NODE_ENV = 'production'

    await app.init()

    process.nextTick(() => app.execute())
    await once(app.emitter, ApplicationEvents.READY)

    expect(app.window).not.toBeUndefined()

    const mocked_window = mocked_BrowserWindow.mock.results[0].value as Electron.BrowserWindow

    expect(mocked_window.loadFile).toHaveBeenCalled()
    expect(mocked_window.loadURL).not.toHaveBeenCalled()
  })

  it('should construct the window with URL on ready with development flag', async () => {
    process.env.NODE_ENV = 'development'

    await app.init()

    process.nextTick(() => app.execute())
    await once(app.emitter, ApplicationEvents.READY)

    expect(app.window).not.toBeUndefined()

    const mocked_window = mocked_BrowserWindow.mock.results[0].value as Electron.BrowserWindow

    expect(mocked_window.loadFile).not.toHaveBeenCalled()
    expect(mocked_window.loadURL).toHaveBeenCalled()
  })

  it('should construct the window on ready with frame flag', async () => {
    process.env.FRAME_WINDOW = 'true'

    await app.init()

    process.nextTick(() => app.execute())
    await once(app.emitter, ApplicationEvents.READY)

    expect(app.window).not.toBeUndefined()

    const options = mocked_BrowserWindow.mock.calls[0][0]

    expect(options.frame).toBeTruthy()
  })

  it('should construct the window on activate', async () => {
    await app.init()

    process.nextTick(() => app.execute())
    await once(app.emitter, ApplicationEvents.READY)

    {
      const mocked_window = mocked_BrowserWindow.mock.results[0].value as Electron.BrowserWindow
      expect(mocked_window.loadFile).toHaveBeenCalledTimes(1)
    }

    process.nextTick(() => ExecElectronAppEvent('activate'))
    await once(app.emitter, ApplicationEvents.READY)

    {
      const mocked_window = mocked_BrowserWindow.mock.results[1].value as Electron.BrowserWindow
      expect(mocked_window.loadFile).toHaveBeenCalledTimes(1)
    }
  })

  it('should catch error and exit when error is thrown in execute', async () => {
    try {
      mocked_electron_app.whenReady.mockRejectedValueOnce(new Error('Mocked Error'))

      await app.init()

      process.nextTick(() => app.execute())
      await once(app.emitter, ApplicationEvents.SHUTDOWN)
    } catch { /* Empty */ }

    expect(mocked_electron_app.quit).toHaveBeenCalled()
  })

  if (process.platform !== 'darwin') {
    it('should exit on all window closed event', async () => {
      await app.init()

      process.nextTick(() => app.execute())
      await once(app.emitter, ApplicationEvents.READY)

      {
        const mocked_window = mocked_BrowserWindow.mock.results[0].value as Electron.BrowserWindow
        expect(mocked_window.loadFile).toHaveBeenCalledTimes(1)
      }

      process.nextTick(() => ExecElectronAppEvent('window-all-closed'))
      await once(app.emitter, ApplicationEvents.SHUTDOWN)

      expect(mocked_electron_app.quit).toHaveBeenCalled()
    })
  }
})
