const { ipcRenderer } = require('electron')

module.exports = {
  ssl_generate_public_key: (target, passphrase) => ipcRenderer.invoke('ssl_generate_public_key', target, passphrase),
  ssl_generate_private_key: (passphrase) => ipcRenderer.invoke('ssl_generate_private_key', passphrase)
}
