import component from '../factory'
import log from 'electron-log/main'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { Script } from 'node:vm'
import { promise_with_reject } from '../../promise'

const environment = {
  require,
  resolve: require.resolve,
  cache: require.cache,
  console: {
    log: (...parameters) => log.info(...parameters),
    error: (...parameters) => log.error(...parameters)
  }
}

const timeout = 30_000

export default component('action')(
  ({ handle }) => {
    handle('invoke', async (source, target, selection) => {
      console.log('invoke test', source, target, selection)
      const stats = await promise_with_reject<fs.Dirent>(fs.lstat)(source)

      const source_script = stats.isDirectory() ? path.join(source, 'index.js') : source

      const contents_raw = await promise_with_reject<string>(fs.readFile)(source_script, 'utf8')

      const script = new Script(contents_raw)

      const content = async (data) => {
        if (data) {
          await promise_with_reject(fs.writeFile)(target, data)
        } else {
          return await promise_with_reject(fs.readFile)(target, 'utf8')
        }
      }

      const require = (query) => {
        const absolute = path.join(source, query)

        if (absolute !== source) {
          try {
            const resolved = environment.resolve(absolute)
            delete environment.cache[resolved]
            return environment.require(absolute)
          } catch (error) {
            log.error(error)
          }
        }

        return environment.require(query)
      }

      const context = { ...environment, content, source, target, selection, require }

      const options = { timeout }

      try {
        const message = await new Promise((resolve, reject) => {
          Object.assign(context, { resolve, reject })
          script.runInNewContext(context, options)
        })

        return { success: true, message, selection: context.selection }
      } catch (error) {
        log.error(error)
        return { success: false, message: error ? String(error) : undefined }
      }
    })
  },
  () => ({ environment, timeout })
)
