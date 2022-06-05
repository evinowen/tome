const { ipcRenderer } = require('electron')

module.exports = {
  is_window_maximized: () => ipcRenderer.invoke('is_window_maximized'),
  restore_window: () => ipcRenderer.invoke('restore_window'),
  maximize_window: () => ipcRenderer.invoke('maximize_window'),
  minimize_window: () => ipcRenderer.invoke('minimize_window'),
  close_window: () => ipcRenderer.invoke('close_window')
}
