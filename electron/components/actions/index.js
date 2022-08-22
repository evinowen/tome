const { ipcMain } = require('electron')

const fs = require('fs')
const path = require('path')
const vm = require('vm')
const { delay } = require('lodash')

const script_timeout = 30000

module.exports = {
  register: () => {
    ipcMain.handle('action_invoke', async (event, source, target) => {
      const stats = await new Promise((resolve, reject) => fs.lstat(source, (err, stats) => err ? reject(err) : resolve(stats)))

      const source_script = stats.isDirectory() ? path.join(source, 'index.js') : source

      const contents_raw = await new Promise((resolve, reject) => fs.readFile(source_script, 'utf8', (error, data) => error ? reject(error) : resolve(data)))

      const script = vm.createScript(contents_raw)

      try {
        const result = await new Promise((resolve, reject) => {
          delay(reject, script_timeout, new Error('Action runtime reached timeout threshold'))

          script.runInNewContext({ resolve, reject, console, source, target })
        })

        return { success: true, result: String(result) }
      } catch (error) {
        return { success: false, result: String(error) }
      }
    })
  }
}
