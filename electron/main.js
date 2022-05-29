const { app, BrowserWindow } = require('electron')

const path = require('path')

require('./components/file').register()
require('./components/git').register()
require('./components/metadata').register()
require('./components/window').register()

let win = null

const createWindow = () => {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    show: false,
    backgroundColor: 'transparent',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadURL('http://localhost:8080/')

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
