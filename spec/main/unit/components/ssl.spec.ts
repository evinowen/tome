import { cloneDeep } from 'lodash'
import * as electron from 'electron'
import * as forge from 'node-forge'
import * as fs from 'node:fs'
import * as tmp from 'tmp-promise'
import helpers from '../../helpers'
import _component from '@/components/ssl'
import preload from '@/components/ssl/preload'

let ipcMainMap
const { optional, random_string, expect_call_parameters_to_return } = helpers(expect)

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: {
    handle: jest.fn(),
    removeHandler: jest.fn()
  },
  ipcRenderer: { invoke: jest.fn() },
  app: {
    getPath: jest.fn()
  }
}))

const mocked_electron = jest.mocked(electron)
mocked_electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
mocked_electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

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

jest.mock('node:fs', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn()
}))

let error: Error
const mocked_fs = jest.mocked(fs)
mocked_fs.readFile.mockImplementation((path, options?, callback?) => optional(options, callback)(undefined, random_string()))
mocked_fs.writeFile.mockImplementation((file, data, callback) => callback(error))

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

  beforeEach(() => {
    ipcMainMap = new Map()
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

  it('should generate public key without decryption if not passphrase is provided upon call to generate_public_key', async () => {
    const target = '/id_rsa'
    await preload.generate_public_key(target)

    expect(forge.pki.decryptRsaPrivateKey).not.toHaveBeenCalled()
    expect(forge.pki.privateKeyFromPem).toHaveBeenCalled()

    expect_call_parameters_to_return(tmp.file, [], Promise.resolve({}))
  })

  it('should generate public key after decryption if passphrase is provided upon call to generate_public_key', async () => {
    const target = '/id_rsa'
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
