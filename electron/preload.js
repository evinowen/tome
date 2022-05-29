const { ipcRenderer } = window.require('electron')

const fs = require('fs')
const path = require('path')

const git = require('./components/git/preload')

window.api = {
  ...git,
  fs,
  file_exists: (path) => ipcRenderer.invoke('file_exists', path),
  file_contents: (path) => ipcRenderer.invoke('file_contents', path),
  path,
  app_getPath: (path) => {
    console.log('app_getPathapp_getPathapp_getPathapp_getPathapp_getPath')
    return ipcRenderer.invoke('app_getPath', path)
  },
  select_directory: () => {
    console.log('select_directory')
    return ipcRenderer.invoke('select_directory')
  },
  is_window_maximized: () => ipcRenderer.invoke('is_window_maximized'),
  restore_window: () => ipcRenderer.invoke('restore_window'),
  maximize_window: () => ipcRenderer.invoke('maximize_window'),
  minimize_window: () => ipcRenderer.invoke('minimize_window'),
  close_window: () => ipcRenderer.invoke('close_window')
}
