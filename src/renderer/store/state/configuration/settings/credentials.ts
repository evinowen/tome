export enum CredentialType {
  Key = 'key',
  Password = 'password',
}

export interface State {
  type: CredentialType
  username: string
  password: string
  private_key: string
  public_key: string
  passphrase: string
}

export default (): State => ({
  type: CredentialType.Key,
  username: '',
  password: '',
  private_key: '',
  public_key: '',
  passphrase: '',
})
