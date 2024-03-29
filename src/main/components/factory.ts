import { ipcMain } from 'electron'
import log from 'electron-log/main'

export default (namespace) => {
  const handle = (channel, listener) => {
    const channel_absolute = [ namespace, channel ].join('-')
    ipcMain.removeHandler(channel_absolute)
    ipcMain.handle(channel_absolute, async (...parameters) => {
      const { processId, frameId } = parameters.shift()
      log.info(`Handle ${namespace} ${channel}`, { processId, frameId })

      return await listener(...parameters)
    })
  }

  const event = (channel, listener) => {
    ipcMain.on([ namespace, channel ].join('-'), async (...parameters) => {
      const { processId, frameId } = parameters.shift()
      log.info(`Event ${namespace} ${channel}`, { processId, frameId })

      return await listener(...parameters)
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (register, data?: () => Record<string, any>) => ({
    register: (win) => {
      log.info(`Register component ${namespace}`)
      return register({ handle, on: event }, win)
    },
    data: data || (() => ({})),
  })
}
