const { ipcRenderer } = require('electron')

module.exports = (namespace) => (channel) => (...parameters) => (listener) => {
  ipcRenderer.send([namespace, channel].join('-'), ...parameters)
  ipcRenderer.on([namespace, channel].join('-'), listener)
}
