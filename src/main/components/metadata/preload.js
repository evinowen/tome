const { ipcRenderer } = require('electron')

module.exports = {
  app_getPath: (path) => ipcRenderer.invoke('app-getPath', path),
  app_getVersion: () => ipcRenderer.invoke('app-getVersion'),
  app_getProcess: () => ipcRenderer.invoke('app-getProcess')
}
