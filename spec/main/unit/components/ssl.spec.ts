import { jest, describe, beforeEach, afterEach, it, expect } from '@jest/globals'
import { cloneDeep } from 'lodash'
import _component, { ErrorFactory } from '@/components/ssl'
import { ssl as preload } from '@/preload'
import * as electron_meta from '?/meta/electron'

/* node:fs */
import * as node_fs from 'node:fs'
jest.mock('node:fs', () => ({
  promises: {
    readFile: jest.fn(async () => ({} as Buffer)),
    writeFile: jest.fn(async () => ({})),
  },
}))

/* node:path */
jest.mock('node:path', () => ({
  join: jest.fn((...parameters: string[]) => parameters.join('/')),
}))

/* node:crypto */
import * as node_crypto from 'node:crypto'
jest.mock('node:crypto', () => ({
  createPrivateKey: jest.fn(() => ({} as node_crypto.KeyObject)),
  createPublicKey: jest.fn(() => ({
    export: jest.fn(() => ''),
  } as unknown as node_crypto.KeyObject)),
}))

/* node-forge */
import * as node_forge from 'node-forge'
jest.mock('node-forge', () => ({
  pki: {
    publicKeyFromPem: jest.fn(),
    rsa: {
      generateKeyPair: jest.fn(),
    },
  },
  ssh: {
    privateKeyToOpenSSH: jest.fn(() => 'private-key-string'),
    publicKeyToOpenSSH: jest.fn(() => 'public-key-string'),
  },
}))
jest.mocked(node_forge).pki.rsa.generateKeyPair.mockImplementation((options?, callback?) => {
  const keypair = {
    publicKey: { n: Math.random(), e: Math.random() } as unknown as node_forge.pki.rsa.PublicKey,
    privateKey: { n: Math.random(), e: Math.random() } as unknown as node_forge.pki.rsa.PrivateKey,
  }

  callback(undefined, keypair)
  return keypair
})

/* tmp-promise */
import * as tmp from 'tmp-promise'
jest.mock('tmp-promise', () => ({
  file: jest.fn(),
}))
jest.mocked(tmp).file.mockImplementation(async () => ({
  path: 'public-key-path',
} as unknown as tmp.FileResult))

describe('components/ssl', () => {
  let component
  let log

  beforeEach(() => {
    electron_meta.ipc_reset()

    log = {
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
    }

    component = cloneDeep(_component)
    component.register({}, log)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return empty object if no target is provided upon call to generate_public_key', async () => {
    const result = await preload.generate_public_key()

    expect(result.path).toEqual('')
    expect(result.data).toEqual('')
  })

  it('should return public key path and string upon successfull call to generate_public_key', async () => {
    const target = '/home/user/.ssh/id_rsa'
    const result = await preload.generate_public_key(target)

    expect(result.path).toEqual('public-key-path')
    expect(result.data).toEqual('public-key-string')
  })

  it('should generate ErrorFactory.ReadFileError if error occurs reading private key file upon call to generate_public_key', async () => {
    jest.mocked(node_fs).promises.readFile.mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const target = '/home/user/.ssh/id_rsa'
    const result = await preload.generate_public_key(target)

    expect(result.path).toBeUndefined()
    expect(result.data).toBeUndefined()
    expect(result.error).toEqual(ErrorFactory.ReadFileError())
  })

  it('should generate ErrorFactory.CreatePrivateKeyError if error occurs loading private key upon call to generate_public_key', async () => {
    jest.mocked(node_crypto).createPrivateKey.mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const target = '/home/user/.ssh/id_rsa'
    const result = await preload.generate_public_key(target)

    expect(result.path).toBeUndefined()
    expect(result.data).toBeUndefined()
    expect(result.error).toEqual(ErrorFactory.CreatePrivateKeyError())
  })

  it('should generate ErrorFactory.CreatePublicKeyError if error occurs loading public key upon call to generate_public_key', async () => {
    jest.mocked(node_crypto).createPublicKey.mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const target = '/home/user/.ssh/id_rsa'
    const result = await preload.generate_public_key(target)

    expect(result.path).toBeUndefined()
    expect(result.data).toBeUndefined()
    expect(result.error).toEqual(ErrorFactory.CreatePublicKeyError())
  })

  it('should generate ErrorFactory.CreatePublicKeyError if error occurs loading public key upon call to generate_public_key', async () => {
    jest.mocked(node_crypto).createPublicKey.mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const target = '/home/user/.ssh/id_rsa'
    const result = await preload.generate_public_key(target)

    expect(result.path).toBeUndefined()
    expect(result.data).toBeUndefined()
    expect(result.error).toEqual(ErrorFactory.CreatePublicKeyError())
  })

  it('should generate ErrorFactory.NodeForgeCovertPublicKeyToOpenSSHError if error occurs converting private key to OpenSSH format upon call to generate_public_key', async () => {
    jest.mocked(node_forge).ssh.publicKeyToOpenSSH.mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const target = '/home/user/.ssh/id_rsa'
    const result = await preload.generate_public_key(target)

    expect(result.path).toBeUndefined()
    expect(result.data).toBeUndefined()
    expect(result.error).toEqual(ErrorFactory.NodeForgeCovertPublicKeyToOpenSSHError())
  })

  it('should generate ErrorFactory.TemporaryFileGenerationError if error occurs generating temporary file for public key upon call to generate_public_key', async () => {
    jest.mocked(tmp).file.mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const target = '/home/user/.ssh/id_rsa'
    const result = await preload.generate_public_key(target)

    expect(result.path).toBeUndefined()
    expect(result.data).toBeUndefined()
    expect(result.error).toEqual(ErrorFactory.TemporaryFileGenerationError())
  })

  it('should generate ErrorFactory.WritePublicKeyFileError if error occurs writing file for public key upon call to generate_public_key', async () => {
    jest.mocked(node_fs).promises.writeFile.mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const target = '/home/user/.ssh/id_rsa'
    const result = await preload.generate_public_key(target)

    expect(result.path).toBeUndefined()
    expect(result.data).toBeUndefined()
    expect(result.error).toEqual(ErrorFactory.WritePublicKeyFileError('public-key-path'))
  })

  it('should return private key path and string upon successfull call generate_private_key', async () => {
    const passphrase = 'password'
    const result = await preload.generate_private_key(passphrase)

    expect(result.path).toEqual('/home/user/.config/tome/id_rsa')
    expect(result.data).toEqual('private-key-string')
  })

  it('should generate ErrorFactory.WritePrivateKeyFileError if error occurs writing file for public key upon call to generate_private_key', async () => {
    jest.mocked(node_fs).promises.writeFile.mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const passphrase = 'password'
    const result = await preload.generate_private_key(passphrase)

    expect(result.path).toBeUndefined()
    expect(result.data).toBeUndefined()
    expect(result.error).toEqual(ErrorFactory.WritePrivateKeyFileError('/home/user/.config/tome/id_rsa'))
  })
})
