const component = require('../factory')
const { app } = require('electron')

module.exports = component('app')(
  ({ handle }) => {
    handle('getPath', async (event, name) => {
      return app.getPath(name)
    })

    handle('getVersion', async (event) => {
      return process.env.npm_package_version || app.getVersion()
    })

    handle('getProcess', async (event) => {
      return {
        versions: process.versions,
        sandboxed: process.sandboxed === true
      }
    })
  }
)
