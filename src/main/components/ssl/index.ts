import component from '../factory'
import { app } from 'electron'
import * as forge from 'node-forge'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as tmp from 'tmp-promise'
import { promise_with_reject } from '../../promise'

export default component('ssl')(
  ({ handle }) => {
    handle('generate-public-key', async (target, passphrase: string | undefined) => {
      if (!target) {
        return { path: '', data: '' }
      }

      const data = await promise_with_reject<string>(fs.readFile)(target, 'utf8')

      const private_key = passphrase ? forge.pki.decryptRsaPrivateKey(data, passphrase) : forge.pki.privateKeyFromPem(data)

      const public_key = forge.pki.rsa.setPublicKey(private_key.n, private_key.e)

      const ssh_public_key = forge.ssh.publicKeyToOpenSSH(public_key)

      const { path: ssh_public_key_path } = await tmp.file()

      await promise_with_reject(fs.writeFile)(ssh_public_key_path, ssh_public_key)

      return { path: ssh_public_key_path, data: ssh_public_key }
    })

    handle('generate-private-key', async (passphrase) => {
      const { privateKey: private_key } = await new Promise<forge.pki.rsa.KeyPair>((resolve, reject) => {
        forge.pki.rsa.generateKeyPair(
          { bits: 2048, workers: 2 },
          (error, keypair) => error ? reject(error) : resolve(keypair),
        )
      })

      const ssh_private_key = forge.ssh.privateKeyToOpenSSH(private_key, passphrase)
      const ssh_private_key_path = path.join(app.getPath('userData'), 'id_rsa')

      await promise_with_reject(fs.writeFile)(ssh_private_key_path, ssh_private_key)

      return { path: ssh_private_key_path, data: ssh_private_key }
    })
  },
)
