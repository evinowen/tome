const { ipcRenderer } = require('electron')

module.exports = {
  file_subscribe: (path, listener) => {
    ipcRenderer.send('file-subscribe', path)
    ipcRenderer.on('file-subscription_update', listener)
  },
  file_clear_subscriptions: () => ipcRenderer.invoke('file-clear-subscriptions'),
  file_exists: (target) => ipcRenderer.invoke('file-exists', target),
  file_is_directory: (target) => ipcRenderer.invoke('file-is-directory', target),
  file_create: (target) => ipcRenderer.invoke('file-create', target),
  file_create_directory: (target) => ipcRenderer.invoke('file-create-directory', target),
  file_list_directory: (target) => ipcRenderer.invoke('file-list-directory', target),
  file_contents: (target) => ipcRenderer.invoke('file-contents', target),
  file_write: (target, content) => ipcRenderer.invoke('file-write', target, content),
  file_rename: (target, proposed) => ipcRenderer.invoke('file-rename', target, proposed),
  file_open: (target, container) => ipcRenderer.invoke('file-open', target, container),
  file_delete: (target) => ipcRenderer.invoke('file-delete', target),
  select_directory: () => ipcRenderer.invoke('select-directory'),
  directory_list: (target) => ipcRenderer.invoke('directory-list', target),
  search_path: (target, criteria) => ipcRenderer.invoke('search-path', target, criteria),
  search_next: () => ipcRenderer.invoke('search-next')
}
