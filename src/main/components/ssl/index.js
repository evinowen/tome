const factory = require('../factory')
const { app } = require('electron')
const forge = require('node-forge')
const fs = require('fs')
const path = require('path')
const tmp = require('tmp-promise')

const { promise_with_reject } = require('../../promise')

module.exports = factory(
  ({ handle }, win) => {
    handle('ssl-generate-public-key', async (event, target, passphrase = null) => {
      if (!target) {
        return { path: '', data: '' }
      }

      const data = await promise_with_reject(fs.readFile)(target, 'utf8')

      const private_key = passphrase ? forge.pki.decryptRsaPrivateKey(data, passphrase) : forge.pki.privateKeyFromPem(data)

      const public_key = forge.pki.setRsaPublicKey(private_key.n, private_key.e)

      const ssh_public_key = forge.ssh.publicKeyToOpenSSH(public_key)

      const { path: ssh_public_key_path } = await tmp.file()

      await promise_with_reject(fs.writeFile)(ssh_public_key_path, ssh_public_key)

      return { path: ssh_public_key_path, data: ssh_public_key }
    })

    handle('ssl-generate-private-key', async (event, passphrase) => {
      const { privateKey: private_key } = await new Promise((resolve, reject) => {
        forge.pki.rsa.generateKeyPair(
          { bits: 2048, workers: 2 },
          (error, keypair) => error ? reject(error) : resolve(keypair)
        )
      })

      const ssh_private_key = forge.ssh.privateKeyToOpenSSH(private_key, passphrase)
      const ssh_private_key_path = path.join(app.getPath('userData'), 'id_rsa')

      await promise_with_reject(fs.writeFile)(ssh_private_key_path, ssh_private_key)

      return { path: ssh_private_key_path, data: ssh_private_key }
    })
  }
)
