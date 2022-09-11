const { app, BrowserWindow, ipcMain } = require('electron')

const path = require('path')
const util = require('util')

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

  if (process.env.NODE_ENV === 'development') {
    development = true
  }

  if (process.env.FRAME_WINDOW) {
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

app.whenReady().then(async () => {
  await createWindow()

  app.onAsync('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow()
    }
  })
})

app.onAsync('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
