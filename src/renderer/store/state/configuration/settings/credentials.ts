export enum CredentialType {
  Key = 'key',
  Password = 'password',
}

export interface State {
  type: CredentialType
  username: string
  password: string
  prompt_password: boolean
  key: string
  passphrase: string
  prompt_passphrase: boolean
}

export default (): State => ({
  type: CredentialType.Key,
  username: '',
  password: '',
  prompt_password: false,
  key: '',
  passphrase: '',
  prompt_passphrase: false,
})
