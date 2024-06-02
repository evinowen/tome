import { defineStore } from 'pinia'
import { fetch_configuration_store } from '@/store/modules/configuration'
import api from '@/api'

export interface State {
  type?: string
  username?: string
  password?: string
  key?: string
  passphrase?: string
}

export const StateDefaults = (): State => ({
  type: '',
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

      this.type = configuration.credential_type
      this.username = configuration.username
      this.password = configuration.password
      this.key = configuration.private_key
      this.passphrase = configuration.passphrase

      switch (this.type) {
        case 'password': {
          await api.repository.credential_password(
            this.username,
            this.password,
          )
          break
        }

        case 'key': {
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
