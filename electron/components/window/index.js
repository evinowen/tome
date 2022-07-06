const { ipcMain, BrowserWindow } = require('electron')

module.exports = {
  register: () => {
    ipcMain.handle('is_window_maximized', (event) => {
      console.log('Is Window Maximized')
      return BrowserWindow.getFocusedWindow().isMaximized()
    })

    ipcMain.handle('minimize_window', (event) => {
      console.log('Minimize Window')
      BrowserWindow.getFocusedWindow().minimize()
    })

    ipcMain.handle('maximize_window', (event) => {
      console.log('Maximize Window')
      BrowserWindow.getFocusedWindow().maximize()
    })

    ipcMain.handle('restore_window', (event) => {
      console.log('Restore Window')
      BrowserWindow.getFocusedWindow().restore()
    })

    ipcMain.handle('close_window', (event) => {
      console.log('Close Window')
      BrowserWindow.getFocusedWindow().close()
    })
  }
}
