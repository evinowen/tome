const { ipcMain } = require('electron')
const log = require('electron-log')

module.exports = (namespace) => {
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

  return (register, data) => ({
    register: (win) => register({ handle, on: event }, win),
    data
  })
}
