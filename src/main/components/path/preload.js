const { ipcRenderer } = require('electron')

module.exports = {
  path_basename: (query) => ipcRenderer.invoke('path-basename', query),
  path_dirname: (query) => ipcRenderer.invoke('path-dirname', query),
  path_extension: (query) => ipcRenderer.invoke('path-extension', query),
  path_join: (...targets) => ipcRenderer.invoke('path-join', targets),
  path_relative: (base, query) => ipcRenderer.invoke('path-relative', base, query),
  path_sep: () => ipcRenderer.invoke('path-sep')
}
