import component from '@/objects/ComponentFactory'
import { clipboard } from 'electron'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { promise_with_reject, promise_with_boolean } from '@/promise'

export default component('clipboard')(
  ({ handle, log }) => {
    handle('writetext', async (text) => {
      clipboard.writeText(text)
    })

    handle('readtext', async () => {
      return clipboard.readText()
    })

    handle('paste', async (action, source, target) => {
      // Determine the directory where the file will go
      let directory = target
      try {
        // Load the file status of the target to determine if
        // a file or directory is being targetted.
        const status = await promise_with_reject<fs.Dirent>(fs.lstat)(target)

        if (!status.isDirectory()) {
          // The destination is a file, use the parent
          // directory of the file
          directory = path.dirname(target)
        }
      } catch (error) {
        // The destination does not exist
        log.error(error)
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
        case 'cut': {
          await promise_with_reject(fs.rename)(source, destination)
          break
        }

        case 'copy': {
          await promise_with_reject(fs.copyFile)(source, destination)
          break
        }
      }
    })
  },
)
