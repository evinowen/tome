const { cloneDeep } = require('lodash')
const electron = require('electron')
const forge = require('node-forge')
const fs = require('fs')
const tmp = require('tmp-promise')
const { random_string, expect_call_parameters_to_return } = require('?/helpers')(expect)
const _component = require('@/components/ssl')
const preload = require('@/components/ssl/preload')

let ipcMainMap

jest.mock('electron-log', () => ({ info: jest.fn(), error: jest.fn() }))
jest.mock('electron', () => ({
  ipcMain: { handle: jest.fn() },
  ipcRenderer: { invoke: jest.fn() },
  app: {
    getPath: jest.fn()
  }
}))

electron.ipcMain.handle.mockImplementation((channel, listener) => ipcMainMap.set(channel, listener))
electron.ipcRenderer.invoke.mockImplementation((channel, ...data) => ipcMainMap.get(channel)({}, ...data))

jest.mock('node-forge', () => ({
  pki: {
    decryptRsaPrivateKey: jest.fn(),
    privateKeyFromPem: jest.fn(),
    setRsaPublicKey: jest.fn(),
    rsa: {
      generateKeyPair: jest.fn()
    }
  },
  ssh: {
    privateKeyToOpenSSH: jest.fn(),
    publicKeyToOpenSSH: jest.fn()
  }
}))

forge.pki.decryptRsaPrivateKey.mockImplementation((data, passphrase) => ({ n: random_string(), e: random_string() }))
forge.pki.privateKeyFromPem.mockImplementation((data) => ({ n: random_string(), e: random_string() }))
forge.pki.rsa.generateKeyPair.mockImplementation((options, callback) => callback(null, random_string()))

jest.mock('fs', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn()
}))

fs.readFile.mockImplementation((path, encoding, callback) => callback(null, random_string()))
fs.writeFile.mockImplementation((file, data, callback) => callback(null))

jest.mock('path', () => ({
  join: jest.fn()
}))

jest.mock('tmp-promise', () => ({
  file: jest.fn()
}))

tmp.file.mockImplementation(() => random_string(16, true))

describe('SSLComponent', () => {
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
    const result = await preload.ssl.generate_public_key()
    expect(result).toEqual({ path: '', data: '' })

    expect(forge.pki.decryptRsaPrivateKey).not.toHaveBeenCalled()
    expect(forge.pki.privateKeyFromPem).not.toHaveBeenCalled()
  })

  it('should generate public key without decryption if not passphrase is provided upon call to generate_public_key', async () => {
    const target = '/id_rsa'
    const result = await preload.ssl.generate_public_key(target)

    expect(forge.pki.decryptRsaPrivateKey).not.toHaveBeenCalled()
    expect(forge.pki.privateKeyFromPem).toHaveBeenCalled()

    expect_call_parameters_to_return(tmp.file, [], result.path)
  })

  it('should generate public key after decryption if passphrase is provided upon call to generate_public_key', async () => {
    const target = '/id_rsa'
    const passphrase = 'password'
    const result = await preload.ssl.generate_public_key(target, passphrase)

    expect(forge.pki.decryptRsaPrivateKey).toHaveBeenCalled()
    expect(forge.pki.privateKeyFromPem).not.toHaveBeenCalled()

    expect_call_parameters_to_return(tmp.file, [], result.path)
  })

  it('should generate key upon call to generate_private_key', async () => {
    const passphrase = 'password'
    const result = await preload.ssl.generate_private_key(passphrase)

    expect(forge.pki.rsa.generateKeyPair).toHaveBeenCalled()
    expect(forge.ssh.privateKeyToOpenSSH).toHaveBeenCalled()

    expect(result).toBeDefined()
  })
})
