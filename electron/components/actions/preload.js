const { ipcRenderer } = require('electron')

module.exports = {
  action_invoke: (source, target) => ipcRenderer.invoke('action_invoke', source, target)
}
