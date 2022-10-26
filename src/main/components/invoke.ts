import { ipcRenderer } from 'electron'

export default (namespace) => (channel) => (...parameters) => ipcRenderer.invoke([namespace, channel].join('-'), ...parameters)
