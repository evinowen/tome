import { ipcRenderer } from 'electron'
import * as log from 'electron-log'

export default (namespace) => (channel) => (...parameters) => (listener) => {
  const named_channel = [namespace, channel].join('-')
  const named_channel_return = [named_channel, 'return'].join('-')
  ipcRenderer.send(named_channel, named_channel_return, ...parameters)
  ipcRenderer.on(named_channel_return, (...parameters) => {
    const { processId, frameId } = parameters.shift()
    log.info(`Renderer ${namespace} ${channel}`, { processId, frameId })

    return listener(...parameters)
  })
}
