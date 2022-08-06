const { ipcMain, app } = require('electron')

const forge = require('node-forge')
const fs = require('fs')
const path = require('path')
const tmp = require('tmp-promise')

module.exports = {
  register: () => {
    ipcMain.handle('ssl_generate_public_key', async (event, target, passphrase = null) => {
      if (target === '') {
        return { path: '', data: '' }
      }

      const data = await new Promise((resolve, reject) => fs.readFile(target, 'utf8', (error, data) => error ? reject(error) : resolve(data)))

      const private_key = passphrase ? forge.pki.decryptRsaPrivateKey(data, passphrase) : forge.pki.privateKeyFromPem(data)

      const public_key = forge.pki.setRsaPublicKey(private_key.n, private_key.e)

      const ssh_public_key = forge.ssh.publicKeyToOpenSSH(public_key)

      const { path: ssh_public_key_path } = await tmp.file()

      await new Promise((resolve, reject) => fs.writeFile(ssh_public_key_path, ssh_public_key, (err) => err ? reject(err) : resolve(true)))

      return { path: ssh_public_key_path, data: ssh_public_key }
    })

    ipcMain.handle('ssl_generate_private_key', async (event, passphrase = null) => {
      const { privateKey: private_key } = await new Promise((resolve, reject) => {
        forge.pki.rsa.generateKeyPair(
          { bits: 2048, workers: 2 },
          (err, keypair) => err ? reject(err) : resolve(keypair)
        )
      })

      const ssh_private_key = forge.ssh.privateKeyToOpenSSH(private_key, passphrase)
      const ssh_private_key_path = path.join(app.getPath('userData'), 'id_rsa')

      await new Promise((resolve, reject) => fs.writeFile(ssh_private_key_path, ssh_private_key, (err) => err ? reject(err) : resolve(true)))

      return { path: ssh_private_key_path, data: ssh_private_key }
    })
  }
}
