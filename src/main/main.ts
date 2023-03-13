import { app, BrowserWindow, ipcMain } from 'electron'
import * as log from 'electron-log'
import * as path from 'node:path'
import { EventEmitter } from 'node:events'
import ActionsComponent from './components/actions'
import ClipboardComponent from './components/clipboard'
import FileComponent from './components/file'
import RepositoryComponent from './components/repository'
import MetadataComponent from './components/metadata'
import PathComponent from './components/path'
import SslComponent from './components/ssl'
import TemplatesComponent from './components/templates'
import WindowComponent from './components/window'

log.catchErrors()
log.info('Main Process Start')

class Main {
  static window: Electron.BrowserWindow
  static emitter: EventEmitter

  static async main () {
    Main.emitter = (new EventEmitter({ captureRejections: true }))
      .on('create-application', async () => {
        log.info('Application Present')
        await Main.create_window()
      })
      .on('error', (error) => {
        log.error(error)
        Main.emitter.emit('exit-application')
      })
      .on('exit-application', () => {
        log.info('Application Shutdown')
        Main.emitter.removeAllListeners()
        app.quit()
      })

    try {
      await app.whenReady()
      log.info('Application Ready')

      Main.emitter.emit('create-application')

      app.on('activate', () => {
        log.info('Process event: application activate', process.platform)
        Main.emitter.emit('create-application')
      })

      app.on('window-all-closed', () => {
        log.info('Process event: application window-all-closed', process.platform)
        if (process.platform !== 'darwin') {
          Main.emitter.emit('exit-application')
        }
      })

    } catch (error) {
      log.error('Exiting due to fundamental error in main process', error)
    }
  }

  static async create_window () {
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

    Main.window = new BrowserWindow({
      width: 800,
      height: 600,
      frame,
      show: false,
      webPreferences: {
        webSecurity: !development,
        preload: path.join(__dirname, 'preload.js')
      }
    })

    log.info('Window build complete')

    log.info('Registering components with built window')
    Main.register()

    log.info('Loading the window index')
    development
      ? await Main.window.loadURL('http://localhost:8080/')
      : await Main.window.loadFile('index.html')

    log.info('Showing the window')
    Main.window.show()
  }

  static register () {
    log.info('Reset listeners for IPC communication')
    ipcMain.removeAllListeners()

    log.info('Register main process components')

    ActionsComponent.register(Main.window)
    ClipboardComponent.register(Main.window)
    FileComponent.register(Main.window)
    RepositoryComponent.register(Main.window)
    MetadataComponent.register(Main.window)
    PathComponent.register(Main.window)
    SslComponent.register(Main.window)
    TemplatesComponent.register(Main.window)
    WindowComponent.register(Main.window)

    log.info('Component registration complete')
  }
}

export default Main.main()
