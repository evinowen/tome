const { app, BrowserWindow, ipcMain } = require('electron')
const log = require('electron-log')
const path = require('path')
const util = require('util')

log.info('Main Process Start')

const register = (win) => {
  ipcMain.removeAllListeners()

  require('./components/actions').register(win)
  require('./components/clipboard').register(win)
  require('./components/file').register(win)
  require('./components/git').register(win)
  require('./components/metadata').register(win)
  require('./components/path').register(win)
  require('./components/ssl').register(win)
  require('./components/templates').register(win)
  require('./components/window').register(win)
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

  win.on('closed', () => {
    win = null
  })

  register(win)

  if (development) {
    await win.loadURL('http://localhost:8080/')
  } else {
    await win.loadFile('index.html')
  }

  win.show()
}

try {
  module.exports = app.whenReady().then(async () => {
    log.info('Application ready, calling to build window')
    await createWindow()

    app.onAsync('activate', async () => {
      log.info('Process event: activate', process.platform)
      if (BrowserWindow.getAllWindows().length === 0) {
        log.info('Process currently without window, calling to build window')
        await createWindow()
      }
    })
  })

  app.onAsync('window-all-closed', async () => {
    log.info('Process event: window-all-closed', process.platform)
    if (process.platform !== 'darwin') {
      log.info('Process non-darwin, calling to quit application')
      app.quit()
    }
  })
} catch (error) {
  log.error('Exiting due to fundamental error in main process', error)
}
