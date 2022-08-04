const { app, BrowserWindow } = require('electron')

const path = require('path')

require('./components/clipboard').register()
require('./components/file').register()
require('./components/git').register()
require('./components/metadata').register()
require('./components/path').register()
require('./components/ssl').register()
require('./components/window').register()

let win = null

const createWindow = () => {
  let frame = false

  if (process.env.FRAME_WINDOW) {
    frame = true
  }

  win = new BrowserWindow({
    width: 800,
    height: 600,
    frame,
    show: false,
    backgroundColor: 'transparent',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:8080/')
  } else {
    win.loadFile('index.html')
  }

  win.on('closed', () => {
    win = null
  })

  win.once('ready-to-show', () => {
    win.show()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
