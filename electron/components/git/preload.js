
const { ipcRenderer } = window.require('electron')

module.exports = {
  load_repository: (path) => ipcRenderer.invoke('load_repository', path),
  refresh_repository: () => ipcRenderer.invoke('refresh_repository'),
  remote_repository: () => ipcRenderer.invoke('remote_repository'),
  inspect_repository: () => ipcRenderer.invoke('inspect_repository'),
  diff_path_repository: (path) => ipcRenderer.invoke('diff_path_repository', path),
  diff_commit_repository: (commit) => ipcRenderer.invoke('diff_commit_repository', commit),
  credential_repository: (private_key, public_key, passphrase) => ipcRenderer.invoke('credential_repository', private_key, public_key, passphrase),
  push_repository: () => ipcRenderer.invoke('push_repository'),
  load_remote_url_repository: (url) => ipcRenderer.invoke('load_remote_url_repository', url)
}
