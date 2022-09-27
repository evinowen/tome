const { ipcRenderer } = require('electron')

module.exports = {
  app_getPath: (path) => ipcRenderer.invoke('app_getPath', path),
  app_getVersion: () => ipcRenderer.invoke('app_getVersion'),
  app_getProcess: () => ipcRenderer.invoke('app_getProcess')
}
