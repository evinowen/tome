const { ipcRenderer } = require('electron')

module.exports = {
  path_basename: (query) => ipcRenderer.invoke('path_basename', query),
  path_dirname: (query) => ipcRenderer.invoke('path_dirname', query),
  path_extension: (query) => ipcRenderer.invoke('path_extension', query),
  path_join: (...targets) => ipcRenderer.invoke('path_join', targets),
  path_relative: (base, query) => ipcRenderer.invoke('path_relative', base, query),
  path_sep: () => ipcRenderer.invoke('path_sep')
}
