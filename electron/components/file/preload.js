const { ipcRenderer } = require('electron')

module.exports = {
  file_exists: (target) => ipcRenderer.invoke('file_exists', target),
  file_is_directory: (target) => ipcRenderer.invoke('file_is_directory', target),
  file_create: (target) => ipcRenderer.invoke('file_create', target),
  file_create_directory: (target) => ipcRenderer.invoke('file_create_directory', target),
  file_list_directory: (target) => ipcRenderer.invoke('file_list_directory', target),
  file_contents: (target) => ipcRenderer.invoke('file_contents', target),
  file_write: (target, content) => ipcRenderer.invoke('file_write', target, content),
  file_rename: (target, proposed) => ipcRenderer.invoke('file_rename', target, proposed),
  file_delete: (target) => ipcRenderer.invoke('file_delete', target),
  select_directory: () => ipcRenderer.invoke('select_directory'),
  directory_list: (target) => ipcRenderer.invoke('directory_list', target),
  search_path: (target, query) => ipcRenderer.invoke('search_path', target, query),
  search_next: () => ipcRenderer.invoke('search_next')
}
