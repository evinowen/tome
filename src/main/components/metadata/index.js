const factory = require('../factory')
const { app } = require('electron')

module.exports = factory(
  ({ handle }, win) => {
    handle('app-getPath', async (event, name) => {
      return app.getPath(name)
    })

    handle('app-getVersion', async (event) => {
      return process.env.npm_package_version || app.getVersion()
    })

    handle('app-getProcess', async (event) => {
      return {
        versions: process.versions,
        sandboxed: process.sandboxed === true
      }
    })
  }
)
