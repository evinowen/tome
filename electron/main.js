const { app, BrowserWindow, ipcMain } = require('electron')

const path = require('path')

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
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  register(win)

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
