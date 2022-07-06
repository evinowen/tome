const { ipcRenderer } = require('electron')

module.exports = {
  clipboard_paste: (path) => ipcRenderer.invoke('clipboard_paste', path)
}
