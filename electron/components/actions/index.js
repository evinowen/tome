const { ipcMain } = require('electron')

const fs = require('fs')
const path = require('path')
const vm = require('vm')

const timeout = 30000

module.exports = {
  register: () => {
    ipcMain.handle('action_invoke', async (event, source, target, selection) => {
      const stats = await new Promise((resolve, reject) => fs.lstat(source, (err, stats) => err ? reject(err) : resolve(stats)))

      const source_script = stats.isDirectory() ? path.join(source, 'index.js') : source

      const contents_raw = await new Promise((resolve, reject) => fs.readFile(source_script, 'utf8', (error, data) => error ? reject(error) : resolve(data)))

      const script = vm.createScript(contents_raw)

      const content = async (data = null) => {
        if (data) {
          await new Promise((resolve, reject) => fs.writeFile(target, data, (err) => err ? reject(err) : resolve(true)))
        } else {
          return await new Promise((resolve, reject) => fs.readFile(target, 'utf8', (error, data) => error ? reject(error) : resolve(data)))
        }
      }

      const context = { require, console, source, target, content, selection }

      context.require = (query) => {
        const absolute = path.join(source, query)

        if (absolute !== source) {
          try {
            const resolved = require.resolve(absolute)
            delete require.cache[resolved]
            return require(absolute)
          } catch (error) { }
        }

        return require(query)
      }

      const options = { timeout }

      try {
        const message = await new Promise((resolve, reject) => {
          Object.assign(context, { resolve, reject })
          script.runInNewContext(context, options)
        })

        return { success: true, message, selection: context.selection }
      } catch (error) {
        return { success: false, message: error ? String(error) : null }
      }
    })
  }
}
