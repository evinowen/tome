const { ipcRenderer } = require('electron')

module.exports = {
  is_window_maximized: () => ipcRenderer.invoke('is-window-maximized'),
  restore_window: () => ipcRenderer.invoke('restore-window'),
  maximize_window: () => ipcRenderer.invoke('maximize-window'),
  minimize_window: () => ipcRenderer.invoke('minimize-window'),
  close_window: () => ipcRenderer.invoke('close-window')
}
