const factory = require('../factory')
const path = require('path')

module.exports = factory(
  ({ handle }, win) => {
    handle('path-basename', (event, query) => {
      return path.basename(query)
    })

    handle('path-dirname', (event, query) => {
      return path.dirname(query)
    })

    handle('path-extension', (event, query) => {
      const string = path.extname(query)

      if (!string) {
        return
      }

      return string.toLowerCase()
    })

    handle('path-join', (event, targets) => {
      return path.join(...targets)
    })

    handle('path-relative', (event, base, query) => {
      return path.relative(base, query)
    })

    handle('path-sep', (event) => {
      return path.sep
    })
  }
)
