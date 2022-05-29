const { ipcMain, BrowserWindow } = require('electron')

module.exports = {
  register: () => {
    ipcMain.handle('is_window_maximized', (event) => {
      console.log('ipcMain.handle is_window_maximized')
      return BrowserWindow.getFocusedWindow().isMaximized()
    })

    ipcMain.handle('minimize_window', (event) => {
      console.log('ipcMain.handle minimize_window')
      BrowserWindow.getFocusedWindow().minimize()
    })

    ipcMain.handle('maximize_window', (event) => {
      console.log('ipcMain.handle maximize_window')
      BrowserWindow.getFocusedWindow().maximize()
    })

    ipcMain.handle('restore_window', (event) => {
      console.log('ipcMain.handle restore_window')
      BrowserWindow.getFocusedWindow().restore()
    })

    ipcMain.handle('close_window', (event) => {
      console.log('ipcMain.handle close_window')
      BrowserWindow.getFocusedWindow().close()
    })
  }
}
