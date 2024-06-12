import { jest, describe, afterEach, it, expect } from '@jest/globals'
import RepositoryCredentials from '@/objects/repository/RepositoryCredentials'

jest.mock('nodegit')

describe('components/repository/RepositoryCredentials', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should remember credentials set by configure_password', async () => {
    const username = 'username'
    const password = 'password'

    const repository_credentials = new RepositoryCredentials()
    repository_credentials.configure_password(username, password)

    expect(repository_credentials.type).toEqual('password')
    expect(repository_credentials.username).toEqual(username)
    expect(repository_credentials.password).toEqual(password)
  })

  it('should return password callbacks object for NodeGit on call to callbacks with password configured', async () => {
    const username = 'username'
    const password = 'password'

    const repository_credentials = new RepositoryCredentials()
    repository_credentials.configure_password(username, password)

    const hooks = await repository_credentials.callbacks()

    const url = 'git@git.example.com:remote.git'
    const credentials = await hooks.credentials(url, username)
    const certificate_check = await hooks.certificateCheck()

    expect(repository_credentials.type).toEqual('password')
    expect(credentials.username).toEqual(username)
    expect(credentials.password).toEqual(password)
    expect(certificate_check).toEqual(0)
  })

  it('should remember credentials set by configure_key', async () => {
    const private_key = './test_rsa'
    const public_key = './test_rsa.pub'
    const passphrase = '1234'

    const repository_credentials = new RepositoryCredentials()
    repository_credentials.configure_key(private_key, public_key, passphrase)

    expect(repository_credentials.type).toEqual('key')
    expect(repository_credentials.private_key).toEqual(private_key)
    expect(repository_credentials.public_key).toEqual(public_key)
    expect(repository_credentials.passphrase).toEqual(passphrase)
  })

  it('should return key callbacks object for NodeGit on call to callbacks with key configured', async () => {
    const private_key = './test_rsa'
    const public_key = './test_rsa.pub'
    const passphrase = '1234'

    const repository_credentials = new RepositoryCredentials()
    repository_credentials.configure_key(private_key, public_key, passphrase)

    const hooks = await repository_credentials.callbacks()

    const url = 'git@git.example.com:remote.git'
    const username = 'git'
    const credentials = await hooks.credentials(url, username)
    const certificate_check = await hooks.certificateCheck()

    expect(credentials.username).toEqual(username)
    expect(credentials.private_key).toEqual(private_key)
    expect(credentials.public_key).toEqual(public_key)
    expect(credentials.passphrase).toEqual(passphrase)
    expect(certificate_check).toEqual(0)
  })
})
