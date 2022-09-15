const { ipcMain, clipboard } = require('electron')

const fs = require('fs')
const path = require('path')

const { promise_with_reject, promise_with_boolean } = require('../../promise')

module.exports = {
  register: () => {
    ipcMain.handle('clipboard_writetext', async (event, text) => {
      clipboard.writeText(text)
    })

    ipcMain.handle('clipboard_readtext', async (event) => {
      return clipboard.readText()
    })

    ipcMain.handle('clipboard_paste', async (event, action, source, target) => {
      // Determine the directory where the file will go
      let directory = target
      try {
        // Load the file status of the target to determine if
        // a file or directory is being targetted.
        const status = await promise_with_reject(fs.lstat)(target)

        if (!status.isDirectory()) {
          // The destination is a file, use the parent
          // directory of the file
          directory = path.dirname(target)
        }
      } catch (error) {
        // The destination does not exist
        console.log(error)
        throw new Error('Destination does not exist')
      }

      // Abort if the new directory and the source directory
      // are the same
      if (directory === path.dirname(source)) {
        throw new Error('Invalid move, same directory')
      }

      // Determine the basename of the source file
      const basename = path.basename(source)
      const parsed = path.parse(source)

      // Use the file basename to construct an available file name
      let increment = 0
      let destination = path.join(directory, basename)

      while (await promise_with_boolean(fs.access)(destination)) {
        increment++
        destination = path.join(directory, `${parsed.name}.${increment}${parsed.ext}`)
      }

      switch (action) {
        case 'cut':
          await promise_with_reject(fs.rename)(source, destination)
          break

        case 'copy':
          await promise_with_reject(fs.copyFile)(source, destination, 0)
          break
      }
    })
  }
}
