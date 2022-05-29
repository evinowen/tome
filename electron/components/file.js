const { ipcMain, dialog, BrowserWindow } = require('electron')

const fs = require('fs')

module.exports = {
  register: () => {
    ipcMain.handle('file_exists', async (event, path) =>
      new Promise((resolve, reject) => fs.access(path, (error, data) => error ? resolve(false) : resolve(true))))

    ipcMain.handle('file_contents', async (event, path) =>
      new Promise((resolve, reject) => fs.readFile(path, 'utf8', (error, data) => error ? reject(error) : resolve(data))))

    ipcMain.handle('select_directory', (event) => {
      console.log('ipcMain.handle select_directory')
      const window = BrowserWindow.getFocusedWindow()
      const options = {
        title: 'Select Tome Directory',
        properties: ['openDirectory']
      }

      return dialog.showOpenDialog(window, options)
    })
  }
}
