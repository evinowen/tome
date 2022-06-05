const { ipcMain } = require('electron')

const path = require('path')

module.exports = {
  register: () => {
    ipcMain.handle('path_basename', (event, query) => {
      return path.basename(query)
    })

    ipcMain.handle('path_dirname', (event, query) => {
      return path.dirname(query)
    })

    ipcMain.handle('path_extension', (event, query) => {
      const string = path.extname(query)

      if (!string) {
        return
      }

      return string.toLowerCase()
    })

    ipcMain.handle('path_join', (event, first, second) => {
      return path.join(first, second)
    })

    ipcMain.handle('path_relative', (event, base, query) => {
      return path.relative(base, query)
    })

    ipcMain.handle('path_sep', (event) => {
      return path.sep
    })
  }
}
