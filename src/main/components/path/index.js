const component = require('../factory')
const path = require('path')

module.exports = component('path')(
  ({ handle }) => {
    handle('basename', (event, query) => {
      return path.basename(query)
    })

    handle('dirname', (event, query) => {
      return path.dirname(query)
    })

    handle('extension', (event, query) => {
      const string = path.extname(query)

      if (!string) {
        return
      }

      return string.toLowerCase()
    })

    handle('join', (event, targets) => {
      return path.join(...targets)
    })

    handle('relative', (event, base, query) => {
      return path.relative(base, query)
    })

    handle('sep', (event) => {
      return path.sep
    })
  }
)
