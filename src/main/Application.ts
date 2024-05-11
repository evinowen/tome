import { app, BrowserWindow } from 'electron'
import LogFactory, { Logger } from './LogFactory'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import { EventEmitter } from 'node:events'
import ActionsComponent from './components/actions'
import ClipboardComponent from './components/clipboard'
import FileComponent from './components/file'
import RepositoryComponent from './components/repository'
import MetadataComponent from './components/app'
import LogComponent from './components/log'
import PathComponent from './components/path'
import SslComponent from './components/ssl'
import TemplatesComponent from './components/templates'
import WindowComponent from './components/window'

if (process.env.NODE_ENV === 'development') {
  app.setName('tome-development')
}

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
  log: Logger

  async start () {
    await this.init()

    return this.execute()
  }

  async init () {
    const log_directory = path.join(app.getPath('userData'), 'logs')
    const log_file = `${(new Date()).toISOString()}.log`.replaceAll(/[:-]/g, '.')
    const log_path = path.join(log_directory, log_file)

    this.log = await LogFactory.build(log_path)
    this.log.info(`Process log established at ${log_path}`)
    this.create_emitter()

    await this.clean_logs(log_directory)
  }

  async clean_logs (log_directory: string) {
    const now = new Date()

    for (const log_directory_file of await fs.readdir(log_directory)) {
      const log_directory_file_full_path = path.join(log_directory, log_directory_file)
      const log_directory_file_stat = await fs.stat(log_directory_file_full_path)

      if (log_directory_file_stat.isDirectory()) {
        continue
      }

      if (path.extname(log_directory_file_full_path) !== '.log') {
        continue
      }

      const diff_time = Math.abs(now.getTime() - log_directory_file_stat.mtime.getTime())
      const diff_days = Math.floor(diff_time / (1000 * 60 * 60 * 24))

      if (diff_days > 30) {
        this.log.info(`Remove old log at ${log_directory_file_full_path}`)
        await fs.unlink(log_directory_file_full_path)
      }
    }
  }

  async execute () {
    try {
      this.log.info('Main Process Start')

      await app.whenReady()

      this.emitter.emit(Events.CREATE_APPLICATION)

      app.on('activate', () => {
        this.log.info('Process event: application activate', process.platform)
        this.emitter.emit(Events.CREATE_APPLICATION)
      })

      app.on('window-all-closed', () => {
        this.log.info('Process event: application window-all-closed', process.platform)
        if (process.platform !== 'darwin') {
          this.emitter.emit(Events.EXIT_APPLICATION)
        }
      })
    } catch (error) {
      this.emitter.emit(Events.ERROR, error)
    }
  }

  create_emitter () {
    // eslint-disable-next-line unicorn/prefer-event-target
    this.emitter = (new EventEmitter({ captureRejections: true }))
      .on(Events.CREATE_APPLICATION, async () => {
        this.log.info('Application Present')
        await this.create_window()
        this.emitter.emit(Events.READY)
      })
      .on(Events.ERROR, (error) => {
        this.log.error(error)
        this.emitter.emit(Events.EXIT_APPLICATION)
      })
      .on(Events.EXIT_APPLICATION, () => {
        app.quit()
        this.emitter.emit(Events.SHUTDOWN)
      })
      .on(Events.READY, async () => {
        this.log.info('Application Ready')
      })
      .on(Events.SHUTDOWN, async () => {
        this.log.info('Application Shutdown')
      })
  }

  async create_window () {
    let development = false
    let frame = false

    this.log.info('Building window for environment', process.env.NODE_ENV)
    if (process.env.NODE_ENV === 'development') {
      development = true
    }

    if (process.env.FRAME_WINDOW) {
      this.log.info('Building window found FRAME_WINDOW flag, window set to build framed')
      frame = true
    }

    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      frame,
      show: false,
      webPreferences: {
        webSecurity: !development,
        preload: path.join(__dirname, 'preload.js'),
      },
    })

    this.log.info('Window build complete')

    this.log.info('Registering components with built window')
    this.register()

    this.log.info('Loading the window index')
    development
      ? await this.window.loadURL('http://localhost:8080/')
      : await this.window.loadFile('index.html')

    this.log.info('Showing the window')
    this.window.show()
  }

  register () {
    this.log.info('Register main process components')

    ActionsComponent.register(this.window, this.log)
    ClipboardComponent.register(this.window, this.log)
    FileComponent.register(this.window, this.log)
    RepositoryComponent.register(this.window, this.log)
    LogComponent.register(this.window, this.log)
    MetadataComponent.register(this.window, this.log)
    PathComponent.register(this.window, this.log)
    SslComponent.register(this.window, this.log)
    TemplatesComponent.register(this.window, this.log)
    WindowComponent.register(this.window, this.log)

    this.log.info('Component registration complete')
  }
}

export default Application
