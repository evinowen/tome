const { ipcMain } = require('electron')

module.exports = {
  register: (win) => {
    ipcMain.handle('is_window_maximized', (event) => {
      return win.isMaximized()
    })

    ipcMain.handle('minimize_window', (event) => {
      console.log('Minimize Window')
      win.minimize()
    })

    ipcMain.handle('maximize_window', (event) => {
      console.log('Maximize Window')
      win.maximize()
    })

    ipcMain.handle('restore_window', (event) => {
      console.log('Restore Window')
      win.restore()
    })

    ipcMain.handle('close_window', (event) => {
      console.log('Close Window')
      win.close()
    })
  }
}
