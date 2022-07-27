const { ipcRenderer } = require('electron')

module.exports = {
  file_exists: (path) => ipcRenderer.invoke('file_exists', path),
  file_is_directory: (path) => ipcRenderer.invoke('file_is_directory', path),
  file_create: (path) => ipcRenderer.invoke('file_create', path),
  file_create_directory: (path) => ipcRenderer.invoke('file_create_directory', path),
  file_list_directory: (path) => ipcRenderer.invoke('file_list_directory', path),
  file_contents: (path) => ipcRenderer.invoke('file_contents', path),
  file_write: (path, content) => ipcRenderer.invoke('file_write', path, content),
  file_rename: (path, proposed) => ipcRenderer.invoke('file_rename', path, proposed),
  file_delete: (path) => ipcRenderer.invoke('file_delete', path),
  select_directory: () => ipcRenderer.invoke('select_directory'),
  directory_list: (path) => ipcRenderer.invoke('directory_list', path)
}
