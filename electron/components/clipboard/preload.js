const { ipcRenderer } = require('electron')

module.exports = {
  clipboard_text: (text) => ipcRenderer.invoke('clipboard_text', text),
  clipboard_paste: (path) => ipcRenderer.invoke('clipboard_paste', path)
}
