import * as NodeGit from 'nodegit'

export enum RepositoryCredentialType {
  Password = 'password',
  Key = 'key',
}

export default class RepositoryCredentials {
  type?: RepositoryCredentialType
  username?: string
  password?: string
  private_key?: string
  public_key?: string
  passphrase?: string

  configure_password (username, password) {
    this.type = RepositoryCredentialType.Password
    this.username = username
    this.password = password
  }

  configure_key (private_key, public_key, passphrase) {
    this.type = RepositoryCredentialType.Key
    this.private_key = private_key
    this.public_key = public_key
    this.passphrase = passphrase
  }

  callbacks () {
    const callbacks: NodeGit.RemoteCallbacks = {
      certificateCheck: () => 0,
    }

    let attempts = 10
    callbacks.credentials = (url, username) => {
      if (this.type === RepositoryCredentialType.Password) {
        if (!attempts--) {
          throw new Error('hook.certificateCheck_break exceeded')
        }

        return NodeGit.Cred.userpassPlaintextNew(
          this.username,
          this.password,
        )
      }

      if (this.type === RepositoryCredentialType.Key) {
        if (!attempts--) {
          throw new Error('hook.certificateCheck_break exceeded')
        }

        return NodeGit.Cred.sshKeyNew(
          username,
          this.public_key,
          this.private_key,
          this.passphrase ?? '',
        )
      }
    }

    return callbacks
  }
}
