const component = require('../factory')

module.exports = component('window')(
  ({ handle }, win) => {
    handle('is-maximized', (event) => {
      return win.isMaximized()
    })

    handle('minimize', (event) => {
      win.minimize()
    })

    handle('maximize', (event) => {
      win.maximize()
    })

    handle('restore', (event) => {
      win.restore()
    })

    handle('close', (event) => {
      win.close()
    })
  }
)
