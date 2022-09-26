const { ipcMain } = require('electron')
const log = require('electron-log')

module.exports = {
  register: (win) => {
    ipcMain.handle('is_window_maximized', (event) => {
      return win.isMaximized()
    })

    ipcMain.handle('minimize_window', (event) => {
      log.info('Minimize Window')
      win.minimize()
    })

    ipcMain.handle('maximize_window', (event) => {
      log.info('Maximize Window')
      win.maximize()
    })

    ipcMain.handle('restore_window', (event) => {
      log.info('Restore Window')
      win.restore()
    })

    ipcMain.handle('close_window', (event) => {
      log.info('Close Window')
      win.close()
    })
  }
}
