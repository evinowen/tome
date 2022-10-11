import component from '../factory'
import * as path from 'node:path'

export = component('path')(
  ({ handle }) => {
    handle('basename', (query) => path.basename(query))

    handle('dirname', (query) => path.dirname(query))

    handle('extension', (query) => {
      const string = path.extname(query)

      if (!string) {
        return
      }

      return string.toLowerCase()
    })

    handle('join', (targets) => path.join(...targets))

    handle('relative', (base, query) => path.relative(base, query))

    handle('sep', () => path.sep)
  }
)
