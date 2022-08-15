const { ipcRenderer } = require('electron')

module.exports = {
  action_invoke: (target) => ipcRenderer.invoke('action_invoke', target)
}
