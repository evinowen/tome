const component = require('../factory')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const environment = {
  require,
  console
}

const timeout = 30000

const { promise_with_reject } = require('../../promise')

module.exports = component('action')(
  ({ handle }) => {
    handle('invoke', async (event, source, target, selection) => {
      const stats = await promise_with_reject(fs.lstat)(source)

      const source_script = stats.isDirectory() ? path.join(source, 'index.js') : source

      const contents_raw = await promise_with_reject(fs.readFile)(source_script, 'utf8')

      const script = vm.createScript(contents_raw)

      const content = async (data = null) => {
        if (data) {
          await promise_with_reject(fs.writeFile)(target, data)
        } else {
          return await promise_with_reject(fs.readFile)(target, 'utf8')
        }
      }

      const context = { ...environment, content, source, target, selection }

      context.require = (query) => {
        const absolute = path.join(source, query)

        if (absolute !== source) {
          try {
            const resolved = environment.require.resolve(absolute)
            delete environment.require.cache[resolved]
            return environment.require(absolute)
          } catch (error) { }
        }

        return environment.require(query)
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
  },
  () => ({ environment, timeout })
)
