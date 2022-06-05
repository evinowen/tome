const { ipcMain, app } = require('electron')

module.exports = {
  register: () => {
    ipcMain.handle('app_getPath', async (event, name) => {
      return app.getPath(name)
    })
  }
}
