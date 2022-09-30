const { app, BrowserWindow, ipcMain } = require('electron')
const log = require('electron-log')
const path = require('path')
const util = require('util')

log.info('Main Process Start')

const register = (win) => {
  log.info('Reset listeners for IPC communication')
  ipcMain.removeAllListeners()

  log.info('Register main process components')

  const components = [
    'actions',
    'clipboard',
    'file',
    'repository',
    'metadata',
    'path',
    'ssl',
    'templates',
    'window'
  ]

  for (const component of components) {
    log.info(`Register component ${component}`)
    require(`./components/${component}`).register(win)
  }

  log.info('Component registration complete')
}

let win = null

app.onAsync = util.promisify(app.on)

const createWindow = async () => {
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

  win = new BrowserWindow({
    width: 800,
    height: 600,
    frame,
    show: false,
    webPreferences: {
      webSecurity: !development,
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  log.info('Window Built')

  win.on('closed', () => {
    log.info('Process event: window closed', process.platform)
    win = null
  })

  log.info('Begin component registration with built window')
  register(win)

  log.info('Load window index')
  if (development) {
    await win.loadURL('http://localhost:8080/')
  } else {
    await win.loadFile('index.html')
  }

  log.info('Show window')
  win.show()
}

try {
  module.exports = app.whenReady().then(async () => {
    log.info('Application ready, calling to build window')
    await createWindow()

    app.onAsync('activate', async () => {
      log.info('Process event: application activate', process.platform)
      if (BrowserWindow.getAllWindows().length === 0) {
        log.info('Process currently without window, calling to build window')
        await createWindow()
      }
    })
  })

  app.onAsync('window-all-closed', async () => {
    log.info('Process event: application window-all-closed', process.platform)
    if (process.platform !== 'darwin') {
      log.info('Process non-darwin, calling to quit application')
      app.quit()
    }
  })
} catch (error) {
  log.error('Exiting due to fundamental error in main process', error)
}
