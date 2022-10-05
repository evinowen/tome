import { ipcMain } from 'electron'
import * as log from 'electron-log'

export default (namespace) => {
  const handle = (channel, listener) => {
    ipcMain.handle([namespace, channel].join('-'), async (...parameters) => {
      const { processId, frameId } = parameters.shift()
      log.info(`Handle ${namespace} ${channel}`, { processId, frameId })

      return await listener(...parameters)
    })
  }

  const event = (channel, listener) => {
    ipcMain.on([namespace, channel].join('-'), async (...parameters) => {
      const { processId, frameId } = parameters.shift()
      log.info(`Event ${namespace} ${channel}`, { processId, frameId })

      return await listener(...parameters)
    })
  }

  return (register, data = {}) => ({
    register: (win) => {
      log.info(`Register component ${namespace}`)
      return register({ handle, on: event }, win)
    },
    data
  })
}
