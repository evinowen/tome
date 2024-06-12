import { ipcMain } from 'electron'
import { Logger } from '@/LogFactory'

export default (namespace) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (register, data?: () => Record<string, any>) => ({
    register: (win, log: Logger) => {
      const handle = (channel, listener) => {
        const channel_absolute = [ namespace, channel ].join('-')
        ipcMain.removeHandler(channel_absolute)
        ipcMain.handle(channel_absolute, async (...parameters) => {
          const { processId, frameId } = parameters.shift()
          log.trace(`Action ${namespace} ${channel} triggered`, { processId, frameId })

          let payload

          try {
            payload = await listener(...parameters)
          } catch (error) {
            log.error(`Action ${namespace} ${channel} error`, error, { stack: error.stack })
            throw error
          }

          log.trace(`Action ${namespace} ${channel} resolved`, payload)
          return payload
        })
      }

      const event = (channel, listener) => {
        ipcMain.on([ namespace, channel ].join('-'), async (...parameters) => {
          const { processId, frameId } = parameters.shift()
          log.trace(`Event ${namespace} ${channel}`, { processId, frameId })

          return await listener(...parameters)
        })
      }

      log.info(`Register component ${namespace}`)
      return register({ handle, on: event, log }, win)
    },
    data: data || (() => ({})),
  })
}
