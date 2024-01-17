import { app, BrowserWindow } from 'electron'
import log from 'electron-log/main'
import * as path from 'node:path'
import { EventEmitter } from 'node:events'
import ActionsComponent from './components/actions'
import ClipboardComponent from './components/clipboard'
import FileComponent from './components/file'
import RepositoryComponent from './components/repository'
import MetadataComponent from './components/app'
import PathComponent from './components/path'
import SslComponent from './components/ssl'
import TemplatesComponent from './components/templates'
import WindowComponent from './components/window'

export const Events = {
  CREATE_APPLICATION: 'create-application',
  EXIT_APPLICATION: 'exit-application',
  ERROR: 'error',
  READY: 'ready',
  SHUTDOWN: 'shutdown',
}

class Application {
  window: BrowserWindow
  emitter: EventEmitter

  constructor() {
    this.emitter = (new EventEmitter({ captureRejections: true }))
      .on(Events.CREATE_APPLICATION, async () => {
        log.info('Application Present')
        await this.create_window()
        this.emitter.emit(Events.READY)
      })
      .on(Events.ERROR, (error) => {
        log.error(error)
        this.emitter.emit(Events.EXIT_APPLICATION)
      })
      .on(Events.EXIT_APPLICATION, () => {
        app.quit()
        this.emitter.emit(Events.SHUTDOWN)
      })
      .on(Events.READY, async () => {
        log.info('Application Ready')
      })
      .on(Events.SHUTDOWN, async () => {
        log.info('Application Shutdown')
      })
  }

  async execute () {
    try {
      log.initialize()
      log.info('Main Process Start')

      await app.whenReady()

      this.emitter.emit(Events.CREATE_APPLICATION)

      app.on('activate', () => {
        log.info('Process event: application activate', process.platform)
        this.emitter.emit(Events.CREATE_APPLICATION)
      })

      app.on('window-all-closed', () => {
        log.info('Process event: application window-all-closed', process.platform)
        if (process.platform !== 'darwin') {
          this.emitter.emit(Events.EXIT_APPLICATION)
        }
      })

    } catch (error) {
      this.emitter.emit(Events.ERROR, error)
    }
  }

  async create_window () {
    let development = false
    let frame = false

    log.info('Building window for environment', process.env.NODE_ENV)
    if (process.env.NODE_ENV === 'development') {
      development = true
    }

    if (process.env.FRAME_WINDOW) {
      log.info('Building window found FRAME_WINDOW flag, window set to build framed')
      frame = true
    }

    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      frame,
      show: false,
      webPreferences: {
        webSecurity: !development,
        preload: path.join(__dirname, 'preload.js')
      }
    })

    log.info('Window build complete', this.window)

    log.info('Registering components with built window')
    this.register()

    log.info('Loading the window index')
    development
      ? await this.window.loadURL('http://localhost:8080/')
      : await this.window.loadFile('index.html')

    log.info('Showing the window')
    this.window.show()
  }

  register () {
    log.info('Register main process components')

    ActionsComponent.register(this.window)
    ClipboardComponent.register(this.window)
    FileComponent.register(this.window)
    RepositoryComponent.register(this.window)
    MetadataComponent.register(this.window)
    PathComponent.register(this.window)
    SslComponent.register(this.window)
    TemplatesComponent.register(this.window)
    WindowComponent.register(this.window)

    log.info('Component registration complete')
  }
}

export default Application
