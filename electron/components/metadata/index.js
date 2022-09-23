const { ipcMain, app } = require('electron')

module.exports = {
  register: () => {
    ipcMain.handle('app_getPath', async (event, name) => {
      return app.getPath(name)
    })

    ipcMain.handle('app_getVersion', async (event) => {
      return process.env.npm_package_version || app.getVersion()
    })

    ipcMain.handle('app_getProcess', async (event) => {
      return {
        versions: process.versions,
        sandboxed: process.sandboxed === true
      }
    })
  }
}
