const { ipcMain, dialog, BrowserWindow } = require('electron')

const fs = require('fs')

module.exports = {
  register: () => {
    ipcMain.handle('file_exists', async (event, path) =>
      new Promise((resolve, reject) => fs.access(path, (error, data) => error ? resolve(false) : resolve(true))))

    ipcMain.handle('file_is_directory', async (event, path) => {
      const stats = await new Promise((resolve, reject) => fs.lstat(path, (err, stats) => err ? reject(err) : resolve(stats)))

      return stats.isDirectory()
    })

    ipcMain.handle('file_create_directory', async (event, path) => {
      if (await new Promise((resolve, reject) => fs.access(path, (err) => err ? resolve(true) : resolve(false)))) {
        await new Promise((resolve, reject) => fs.mkdir(path, (err) => err ? reject(err) : resolve(true)))
      }
    })

    ipcMain.handle('file_list_directory', async (event, path) => {
      const results = await new Promise((resolve, reject) => fs.readdir(path, { withFileTypes: true }, (err, files) => err ? reject(err) : resolve(files)))

      const files = []
      for (const result of results) {
        files.push({
          name: result.name,
          directory: result.isDirectory()
        })
      }

      return files
    })

    ipcMain.handle('file_contents', async (event, path) =>
      new Promise((resolve, reject) => fs.readFile(path, 'utf8', (error, data) => error ? reject(error) : resolve(data))))

    ipcMain.handle('file_create', async (event, target, directory) => {
      if (await new Promise((resolve, reject) => fs.access(target, (err) => err ? resolve(false) : resolve(true)))) {
        return false
      }

      if (directory) {
        await new Promise((resolve, reject) => fs.mkdir(target, (err) => err ? reject(err) : resolve(true)))
      } else {
        await new Promise((resolve, reject) => fs.writeFile(target, '', (err) => err ? reject(err) : resolve(true)))
      }

      return await new Promise((resolve, reject) => fs.access(target, (err) => err ? resolve(false) : resolve(true)))
    })

    ipcMain.handle('file_write', async (event, path, content) => {
      await new Promise((resolve, reject) => fs.writeFile(path, content, 'utf8', (err) => err ? reject(err) : resolve()))
    })

    ipcMain.handle('file_rename', async (event, path, proposed) => {
      await new Promise((resolve, reject) => fs.rename(path, proposed, (err) => err ? reject(err) : resolve(true)))
    })

    ipcMain.handle('file_delete', async (event, path) => {
      const unlink = async (path) => {
        const status = await new Promise((resolve, reject) => fs.lstat(path, (err, status) => err ? reject(err) : resolve(status)))
        if (status.isDirectory()) {
          const files = await new Promise((resolve, reject) => fs.readdir(path, (err, status) => err ? reject(err) : resolve(status)))

          for (const file of files) {
            await unlink(await window.api.path_join(path, file))
          }
        }

        await new Promise((resolve, reject) => fs.unlink(path, (err) => err ? reject(err) : resolve(true)))
      }

      await unlink(path)
    })

    ipcMain.handle('select_directory', (event) => {
      console.log('Select Directory')
      const window = BrowserWindow.getFocusedWindow()
      const options = {
        title: 'Select Tome Directory',
        properties: ['openDirectory']
      }

      return dialog.showOpenDialog(window, options)
    })

    ipcMain.handle('directory_list', async (event, target) => {
      try {
        const stats = await new Promise((resolve, reject) => fs.lstat(target, (err, stats) => err ? reject(err) : resolve(stats)))

        if (!stats.isDirectory()) {
          return
        }
      } catch (error) {
        return
      }

      return new Promise((resolve, reject) => fs.readdir(target, (err, files) => err ? reject(err) : resolve(files)))
    })
  }
}
