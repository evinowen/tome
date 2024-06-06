import { defineStore } from 'pinia'
import { fetch_configuration_store, CredentialType } from '@/store/modules/configuration'
import api from '@/api'

export interface State {
  type?: CredentialType
  username?: string
  password?: string
  key?: string
  passphrase?: string
}

export const StateDefaults = (): State => ({
  type: undefined,
  username: undefined,
  password: undefined,
  key: undefined,
  passphrase: undefined,
})

export const fetch_repository_credentials_store = defineStore('repository-credentials', {
  state: StateDefaults,
  actions: {
    load: async function () {
      const configuration = fetch_configuration_store()

      this.type = configuration.active.credentials.type
      this.username = configuration.active.credentials.username
      this.password = configuration.active.credentials.password
      this.key = configuration.active.credentials.private_key
      this.passphrase = configuration.active.credentials.passphrase

      switch (this.type) {
        case CredentialType.Password: {
          await api.repository.credential_password(
            this.username,
            this.password,
          )
          break
        }

        case CredentialType.Key: {
          const { path: public_key } = await api.ssl.generate_public_key(
            this.key,
            this.passphrase,
          )

          await api.repository.credential_key(
            this.key,
            public_key,
            this.passphrase,
          )
          break
        }
      }
    },
  },
})
