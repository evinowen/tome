import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { cloneDeep } from 'lodash'
import Disk from '../../mocks/support/disk'
import * as forge from 'node-forge'
import * as fs from 'node:fs'
import * as tmp from 'tmp-promise'
import helpers from '../../helpers'
import _component from '@/components/ssl'
import fs_meta from '../../meta/node/fs'
import { ssl as preload } from '@/preload'
import * as fs_mock from '../../mocks/node/fs'
import * as electron_meta from '?/meta/electron'
import * as electron_mock from '?/mocks/electron'

jest.doMock('node:fs', () => fs_mock)
jest.doMock('electron', () => electron_mock)

const { optional, random_string, expect_call_parameters_to_return } = helpers(expect)

jest.mock('node-forge', () => ({
  pki: {
    decryptRsaPrivateKey: jest.fn(),
    privateKeyFromPem: jest.fn(),
    rsa: {
      setPublicKey: jest.fn(),
      generateKeyPair: jest.fn()
    }
  },
  ssh: {
    privateKeyToOpenSSH: jest.fn(),
    publicKeyToOpenSSH: jest.fn()
  }
}))

const mocked_forge = jest.mocked(forge)
mocked_forge.pki.decryptRsaPrivateKey.mockImplementation(() => ({ n: Math.random(), e: Math.random() } as unknown as forge.pki.rsa.PrivateKey))
mocked_forge.pki.privateKeyFromPem.mockImplementation(() => ({ n: Math.random(), e: Math.random() } as unknown as forge.pki.rsa.PrivateKey))
mocked_forge.pki.rsa.generateKeyPair.mockImplementation((options?, callback?) => {
  const keypair = {
    publicKey: { n: Math.random(), e: Math.random() } as unknown as forge.pki.rsa.PublicKey,
    privateKey: { n: Math.random(), e: Math.random() } as unknown as forge.pki.rsa.PrivateKey
  }

  callback(undefined, keypair)
  return keypair
})

jest.mock('node:path', () => ({
  join: jest.fn()
}))

jest.mock('tmp-promise', () => ({
  file: jest.fn()
}))

const mocked_temporary = jest.mocked(tmp)
mocked_temporary.file.mockImplementation(() => Promise.resolve({ path: random_string(16, true), fd: 0, cleanup: () => Promise.resolve() }))

describe('components/ssl', () => {
  let component
  const disk = new Disk

  beforeEach(() => {
    electron_meta.ipc_reset()

    fs_meta.set_disk(disk)
    disk.reset_disk()

    component = cloneDeep(_component)
    component.register()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return empty object if no target is provided upon call to generate_public_key', async () => {
    const result = await preload.generate_public_key()
    expect(result).toEqual({ path: '', data: '' })

    expect(forge.pki.decryptRsaPrivateKey).not.toHaveBeenCalled()
    expect(forge.pki.privateKeyFromPem).not.toHaveBeenCalled()
  })

  it('should generate public key without decryption if no passphrase is provided upon call to generate_public_key', async () => {
    const target = '/home/user/.ssh/id_rsa'
    await preload.generate_public_key(target)

    expect(forge.pki.decryptRsaPrivateKey).not.toHaveBeenCalled()
    expect(forge.pki.privateKeyFromPem).toHaveBeenCalled()

    expect_call_parameters_to_return(tmp.file, [], Promise.resolve({}))
  })

  it('should generate public key after decryption if passphrase is provided upon call to generate_public_key', async () => {
    const target = '/home/user/.ssh/id_rsa'
    const passphrase = 'password'
    await preload.generate_public_key(target, passphrase)

    expect(forge.pki.decryptRsaPrivateKey).toHaveBeenCalled()
    expect(forge.pki.privateKeyFromPem).not.toHaveBeenCalled()

    expect_call_parameters_to_return(tmp.file, [], Promise.resolve({}))
  })

  it('should generate key upon call to generate_private_key', async () => {
    const passphrase = 'password'
    const result = await preload.generate_private_key(passphrase)

    expect(forge.pki.rsa.generateKeyPair).toHaveBeenCalled()
    expect(forge.ssh.privateKeyToOpenSSH).toHaveBeenCalled()

    expect(result).toBeDefined()
  })
})
