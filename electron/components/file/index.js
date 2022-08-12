const { ipcMain, dialog, BrowserWindow } = require('electron')

const fs = require('fs')

module.exports = {
  register: () => {
    ipcMain.handle('file_exists', async (event, target) =>
      new Promise((resolve, reject) => fs.access(target, (error, data) => error ? resolve(false) : resolve(true))))

    ipcMain.handle('file_is_directory', async (event, target) => {
      const stats = await new Promise((resolve, reject) => fs.lstat(target, (err, stats) => err ? reject(err) : resolve(stats)))

      return stats.isDirectory()
    })

    ipcMain.handle('file_create_directory', async (event, target) => {
      if (await new Promise((resolve, reject) => fs.access(target, (err) => err ? resolve(true) : resolve(false)))) {
        await new Promise((resolve, reject) => fs.mkdir(target, (err) => err ? reject(err) : resolve(true)))
      }

      return await new Promise((resolve, reject) => fs.access(target, (err) => err ? resolve(false) : resolve(true)))
    })

    ipcMain.handle('file_list_directory', async (event, target) => {
      const results = await new Promise((resolve, reject) => fs.readdir(target, { withFileTypes: true }, (err, files) => err ? reject(err) : resolve(files)))

      const files = []
      for (const result of results) {
        files.push({
          name: result.name,
          directory: result.isDirectory()
        })
      }

      return files
    })

    ipcMain.handle('file_contents', async (event, target) =>
      new Promise((resolve, reject) => fs.readFile(target, 'utf8', (error, data) => error ? reject(error) : resolve(data))))

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

    ipcMain.handle('file_write', async (event, target, content) => {
      await new Promise((resolve, reject) => fs.writeFile(target, content, 'utf8', (err) => err ? reject(err) : resolve()))
    })

    ipcMain.handle('file_rename', async (event, target, proposed) => {
      await new Promise((resolve, reject) => fs.rename(target, proposed, (err) => err ? reject(err) : resolve(true)))
    })

    ipcMain.handle('file_delete', async (event, target) => {
      const unlink = async (target) => {
        const status = await new Promise((resolve, reject) => fs.lstat(target, (err, status) => err ? reject(err) : resolve(status)))
        if (status.isDirectory()) {
          const files = await new Promise((resolve, reject) => fs.readdir(target, (err, status) => err ? reject(err) : resolve(status)))

          for (const file of files) {
            await unlink(await path.join(target, file))
          }
        }

        await new Promise((resolve, reject) => fs.unlink(target, (err) => err ? reject(err) : resolve(true)))
      }

      await unlink(target)
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
