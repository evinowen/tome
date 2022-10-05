import component from '../factory'
import { app } from 'electron'

export = component('app')(
  ({ handle }) => {
    handle('getPath', async (name) => app.getPath(name))

    handle('getVersion', async () => process.env.npm_package_version || app.getVersion())

    handle('getProcess', async () => ({ versions: process.versions, sandboxed: process.sandboxed === true }))
  }
)
