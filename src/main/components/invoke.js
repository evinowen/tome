const { ipcRenderer } = require('electron')

module.exports = (namespace) => (channel) => (...parameters) => ipcRenderer.invoke([namespace, channel].join('-'), ...parameters)
