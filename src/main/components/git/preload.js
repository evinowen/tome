
const { ipcRenderer } = require('electron')

module.exports = {
  load_repository: (path) => ipcRenderer.invoke('load-repository', path),
  refresh_repository: () => ipcRenderer.invoke('refresh-repository'),
  refresh_patches_repository: () => ipcRenderer.invoke('refresh-patches-repository'),
  remote_repository: () => ipcRenderer.invoke('remote-repository'),
  inspect_repository: () => ipcRenderer.invoke('inspect-repository'),
  diff_path_repository: (path) => ipcRenderer.invoke('diff-path-repository', path),
  diff_commit_repository: (commit) => ipcRenderer.invoke('diff-commit-repository', commit),
  credential_repository: (private_key, public_key, passphrase) => ipcRenderer.invoke('credential-repository', private_key, public_key, passphrase),
  stage_repository: (query) => ipcRenderer.invoke('stage-repository', query),
  reset_repository: (query) => ipcRenderer.invoke('reset-repository', query),
  push_repository: () => ipcRenderer.invoke('push-repository'),
  clear_remote_repository: (url) => ipcRenderer.invoke('clear-remote-repository'),
  load_remote_url_repository: (url) => ipcRenderer.invoke('load-remote-url-repository', url),
  commit_repository: (name, email, message) => ipcRenderer.invoke('commit-repository', name, email, message)
}
