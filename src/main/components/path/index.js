const component = require('../factory')
const path = require('path')

module.exports = component('path')(
  ({ handle }) => {
    handle('basename', (event, query) => path.basename(query))

    handle('dirname', (event, query) => path.dirname(query))

    handle('extension', (event, query) => {
      const string = path.extname(query)

      if (!string) {
        return
      }

      return string.toLowerCase()
    })

    handle('join', (event, targets) => path.join(...targets))

    handle('relative', (event, base, query) => path.relative(base, query))

    handle('sep', (event) => path.sep)
  }
)
