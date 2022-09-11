const { ipcRenderer } = require('electron')

module.exports = {
  clipboard_writetext: (text) => ipcRenderer.invoke('clipboard_text', text),
  clipboard_readtext: (text) => ipcRenderer.invoke('clipboard_readtext'),
  clipboard_paste: (path) => ipcRenderer.invoke('clipboard_paste', path)
}
