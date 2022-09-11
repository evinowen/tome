
const { ipcRenderer } = window.require('electron')

module.exports = {
  load_repository: (path) => ipcRenderer.invoke('load_repository', path),
  refresh_repository: () => ipcRenderer.invoke('refresh_repository'),
  refresh_patches_repository: () => ipcRenderer.invoke('refresh_patches_repository'),
  remote_repository: () => ipcRenderer.invoke('remote_repository'),
  inspect_repository: () => ipcRenderer.invoke('inspect_repository'),
  diff_path_repository: (path) => ipcRenderer.invoke('diff_path_repository', path),
  diff_commit_repository: (commit) => ipcRenderer.invoke('diff_commit_repository', commit),
  credential_repository: (private_key, public_key, passphrase) => ipcRenderer.invoke('credential_repository', private_key, public_key, passphrase),
  stage_repository: (query) => ipcRenderer.invoke('stage_repository', query),
  reset_repository: (query) => ipcRenderer.invoke('reset_repository', query),
  push_repository: () => ipcRenderer.invoke('push_repository'),
  clear_remote_repository: (url) => ipcRenderer.invoke('clear_remote_repository'),
  load_remote_url_repository: (url) => ipcRenderer.invoke('load_remote_url_repository', url),
  commit_repository: (name, email, message) => ipcRenderer.invoke('commit_repository', name, email, message)
}
