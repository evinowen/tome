const { ipcRenderer } = require('electron')

module.exports = {
  app_getPath: (path) => ipcRenderer.invoke('app_getPath', path)
}
