const { ipcMain } = require('electron')

const fs = require('fs')
const tmp = require('tmp-promise')
const forge = require('node-forge')

module.exports = {
  register: () => {
    ipcMain.handle('ssl_generate_public_key', async (event, target, passphrase = null) => {
      const data = await new Promise((resolve, reject) => fs.readFile(target, 'utf8', (error, data) => error ? reject(error) : resolve(data)))

      const private_key = passphrase ? forge.pki.decryptRsaPrivateKey(data, passphrase) : forge.pki.privateKeyFromPem(data)

      const public_key = forge.pki.setRsaPublicKey(private_key.n, private_key.e)

      const ssh_public_key = forge.ssh.publicKeyToOpenSSH(public_key)

      const { path: ssh_public_key_path } = await tmp.file()

      await new Promise((resolve, reject) => fs.writeFile(ssh_public_key_path, ssh_public_key, (err) => err ? reject(err) : resolve(true)))

      return { path: ssh_public_key_path, data: ssh_public_key }
    })
  }
}
