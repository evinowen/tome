const factory = require('../factory')

module.exports = factory(
  ({ handle }, win) => {
    handle('is-window-maximized', (event) => {
      return win.isMaximized()
    })

    handle('minimize-window', (event) => {
      win.minimize()
    })

    handle('maximize-window', (event) => {
      win.maximize()
    })

    handle('restore-window', (event) => {
      win.restore()
    })

    handle('close-window', (event) => {
      win.close()
    })
  }
)
