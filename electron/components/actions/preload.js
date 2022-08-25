const { ipcRenderer } = require('electron')

module.exports = {
  action_invoke: (source, target, selection) => ipcRenderer.invoke('action_invoke', source, target, selection)
}
