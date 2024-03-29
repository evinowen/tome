import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { cloneDeep } from 'lodash'
import * as electron from 'electron'
import log from 'electron-log/main'
import { once } from 'node:events'
import Application, { Events as ApplicationEvents } from '@/Application'

jest.mock('@/components/actions', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/clipboard', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/file', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/repository', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/app', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/path', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/ssl', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/templates', () => ({ default: { register: jest.fn(), data: jest.fn() } }))
jest.mock('@/components/window', () => ({ default: { register: jest.fn(), data: jest.fn() } }))

jest.mock('electron-log/main')
jest.mock('electron')

const mocked_log = jest.mocked(log)

jest.mock('node:path', () => ({
  join: jest.fn(),
}))

const mocked_electron_app = jest.mocked(electron.app)
const mocked_BrowserWindow = jest.mocked(electron.BrowserWindow)

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
    expect(app.emitter).not.toBeUndefined()
  })

  it('should initalize log on execute', async () => {
    expect(mocked_log.initialize).not.toHaveBeenCalled()

    await app.execute()

    expect(mocked_log.initialize).toHaveBeenCalled()
  })

  it('should construct the window on ready', async () => {
    expect(app.window).toBeUndefined()

    process.nextTick(() => app.execute())
    await once(app.emitter, ApplicationEvents.READY)

    expect(app.window).not.toBeUndefined()
  })

  it('should construct the window with file load on ready', async () => {
    process.env.NODE_ENV = 'production'

    process.nextTick(() => app.execute())
    await once(app.emitter, ApplicationEvents.READY)

    expect(app.window).not.toBeUndefined()

    const mocked_window = mocked_BrowserWindow.mock.instances[0]

    expect(mocked_window.loadFile).toHaveBeenCalled()
    expect(mocked_window.loadURL).not.toHaveBeenCalled()
  })

  it('should construct the window with URL on ready with development flag', async () => {
    process.env.NODE_ENV = 'development'

    process.nextTick(() => app.execute())
    await once(app.emitter, ApplicationEvents.READY)

    expect(app.window).not.toBeUndefined()

    const mocked_window = mocked_BrowserWindow.mock.instances[0]

    expect(mocked_window.loadFile).not.toHaveBeenCalled()
    expect(mocked_window.loadURL).toHaveBeenCalled()
  })

  it('should construct the window on ready with frame flag', async () => {
    process.env.FRAME_WINDOW = 'true'

    process.nextTick(() => app.execute())
    await once(app.emitter, ApplicationEvents.READY)

    expect(app.window).not.toBeUndefined()

    const options = mocked_BrowserWindow.mock.calls[0][0]

    expect(options.frame).toBeTruthy()
  })

  it('should construct the window on activate', async () => {
    process.nextTick(() => app.execute())
    await once(app.emitter, ApplicationEvents.READY)

    {
      const mocked_window = mocked_BrowserWindow.mock.instances[0]
      expect(mocked_window.loadFile).toHaveBeenCalledTimes(1)
    }

    process.nextTick(() => ExecElectronAppEvent('activate'))
    await once(app.emitter, ApplicationEvents.READY)

    {
      const mocked_window = mocked_BrowserWindow.mock.instances[1]
      expect(mocked_window.loadFile).toHaveBeenCalledTimes(1)
    }
  })

  it('should catch error and exit when error is thrown in execute', async () => {
    mocked_electron_app.whenReady.mockRejectedValueOnce(() => new Error('Mocked Error'))

    process.nextTick(() => app.execute())

    await once(app.emitter, ApplicationEvents.SHUTDOWN)

    expect(mocked_electron_app.quit).toHaveBeenCalled()
  })

  if (process.platform !== 'darwin') {
    it('should exit on all window closed event', async () => {
      process.nextTick(() => app.execute())
      await once(app.emitter, ApplicationEvents.READY)

      {
        const mocked_window = mocked_BrowserWindow.mock.instances[0]
        expect(mocked_window.loadFile).toHaveBeenCalledTimes(1)
      }

      process.nextTick(() => ExecElectronAppEvent('window-all-closed'))
      await once(app.emitter, ApplicationEvents.SHUTDOWN)

      expect(mocked_electron_app.quit).toHaveBeenCalled()
    })
  }
})
