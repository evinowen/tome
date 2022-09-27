const { ipcRenderer } = require('electron')

module.exports = {
  clipboard_writetext: (text) => ipcRenderer.invoke('clipboard-writetext', text),
  clipboard_readtext: (text) => ipcRenderer.invoke('clipboard-readtext'),
  clipboard_paste: (path) => ipcRenderer.invoke('clipboard-paste', path)
}
