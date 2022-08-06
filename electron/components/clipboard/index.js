const { ipcMain, clipboard } = require('electron')

const fs = require('fs')
const path = require('path')

module.exports = {
  register: () => {
    ipcMain.handle('clipboard_text', async (event, text) => {
      clipboard.writeText(text)
    })

    ipcMain.handle('clipboard_paste', async (event, action, source, target) => {
      // Determine the directory where the file will go
      let directory = target
      try {
        // Load the file status of the target to determine if
        // a file or directory is being targetted.
        const status = await new Promise((resolve, reject) => fs.lstat(target, (err, status) => err ? reject(err) : resolve(status)))

        if (!status.isDirectory()) {
          // The destination is a file, use the parent
          // directory of the file
          directory = await window.api.path_dirname(target)
        }
      } catch (error) {
        // The destination does not exist
        throw new Error('Destination does not exist')
      }

      // Abort if the new directory and the source directory
      // are the same
      if (directory === await window.api.path_dirname(source)) {
        throw new Error('Invalid move, same directory')
      }

      // Determine the basename of the source file
      const basename = path.basename(source)
      const parsed = path.parse(source)

      // Use the file basename to construct an available file name
      let increment = 0
      let destination = path.join(directory, basename)

      while (await new Promise((resolve, reject) => fs.access(destination, (err) => err ? resolve(false) : resolve(true)))) {
        increment++
        destination = path.join(directory, `${parsed.name}.${increment}${parsed.ext}`)
      }

      switch (action) {
        case 'cut':
          await new Promise((resolve, reject) => fs.rename(source, destination, (error) => error ? reject(error) : resolve(true)))
          break

        case 'copy':
          await new Promise((resolve, reject) => fs.copyFile(source, destination, 0, (error) => error ? reject(error) : resolve(true)))
          break
      }
    })
  }
}
