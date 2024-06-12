import component from '@/objects/ComponentFactory'
import { app } from 'electron'
import * as forge from 'node-forge'
import * as node_crypto from 'node:crypto'
import * as node_fs from 'node:fs'
import * as node_path from 'node:path'
import * as tmp from 'tmp-promise'

export class ErrorFactory {
  static ReadFileError = () => 'Failed to open Private Key file.'
  static CreatePrivateKeyError = () => 'Failed to decrypt Private Key details.'
  static CreatePublicKeyError = () => 'Failed to export Public Key to PEM.'
  static NodeForgeCovertPublicKeyToOpenSSHError = () => 'Failed convert Public Key PEM export to OpenSSH key format.'
  static TemporaryFileGenerationError = () => 'Failed to generate temporary file for Public Key.'
  static WritePublicKeyFileError = (path) => `Failure to write Public Key to temporary file. ${path}`
  static WritePrivateKeyFileError = (path) => `Failure to write Private Key to user data file. ${path}`
}

export default component('ssl')(
  ({ handle }) => {
    handle('generate-public-key', async (target, passphrase: string | undefined) => {
      if (!target) {
        return { path: '', data: '' }
      }

      let buffer: Buffer
      try {
        buffer = await node_fs.promises.readFile(target)
      } catch {
        return { error: ErrorFactory.ReadFileError() }
      }

      let private_key: node_crypto.KeyObject
      try {
        private_key = node_crypto.createPrivateKey({ key: buffer, passphrase })
      } catch {
        return { error: ErrorFactory.CreatePrivateKeyError() }
      }

      let public_key_export: string
      try {
        const public_key = node_crypto.createPublicKey(private_key)
        public_key_export = public_key.export({ type: 'pkcs1', format: 'pem' }) as string
      } catch {
        return { error: ErrorFactory.CreatePublicKeyError() }
      }

      let ssh_public_key: string
      try {
        ssh_public_key = forge.ssh.publicKeyToOpenSSH(forge.pki.publicKeyFromPem(public_key_export))
      } catch {
        return { error: ErrorFactory.NodeForgeCovertPublicKeyToOpenSSHError() }
      }

      let ssh_public_key_path: string
      try {
        const result = await tmp.file()
        ssh_public_key_path = result.path
      } catch {
        return { error: ErrorFactory.TemporaryFileGenerationError() }
      }

      try {
        await node_fs.promises.writeFile(ssh_public_key_path, ssh_public_key)
      } catch {
        return { error: ErrorFactory.WritePublicKeyFileError(ssh_public_key_path) }
      }

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
      const ssh_private_key_path = node_path.join(app.getPath('userData'), 'id_rsa')

      try {
        await node_fs.promises.writeFile(ssh_private_key_path, ssh_private_key)
      } catch {
        return { error: ErrorFactory.WritePrivateKeyFileError(ssh_private_key_path) }
      }

      return { path: ssh_private_key_path, data: ssh_private_key }
    })
  },
)
