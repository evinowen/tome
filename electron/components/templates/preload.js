const { ipcRenderer } = require('electron')

module.exports = {
  template_invoke: (source, target) => ipcRenderer.invoke('template_invoke', source, target)
}
