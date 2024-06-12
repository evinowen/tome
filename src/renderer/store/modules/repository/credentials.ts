import { defineStore } from 'pinia'
import { fetch_configuration_store, CredentialType } from '@/store/modules/configuration'
import { fetch_log_store } from '@/store/modules/log'
import api from '@/api'

export interface State {
  visible: boolean
  resolve?: () => void
  reject?: (Error) => void
}

export const StateDefaults = (): State => ({
  visible: false,
  resolve: undefined,
})

export const fetch_repository_credentials_store = defineStore('repository-credentials', {
  state: StateDefaults,
  actions: {
    load: async function () {
      const configuration = fetch_configuration_store()

      switch (configuration.active.credentials.type) {
        case CredentialType.Password: {
          return configuration.active.credentials.prompt_password
            ? this.prompt()
            : this.submit(configuration.active.credentials.password)
        }

        case CredentialType.Key: {
          return configuration.active.credentials.prompt_passphrase
            ? this.prompt()
            : this.submit(configuration.active.credentials.passphrase)
        }
      }
    },
    prompt: function () {
      this.visible = true
      return new Promise<void>((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    cancel: function () {
      this.visible = false
      if (this.reject) {
        this.reject(new Error('Credential input was cancelled by the user.'))
      }
    },
    submit: function (password) {
      const configuration = fetch_configuration_store()

      this.visible = false

      switch (configuration.active.credentials.type) {
        case CredentialType.Password: {
          this.send_userpass(
            configuration.active.credentials.username,
            password,
          )
          break
        }

        case CredentialType.Key: {
          this.send_key(
            configuration.active.credentials.key,
            password,
          )
          break
        }
      }

      if (this.resolve) {
        this.resolve()
      }
    },
    send_userpass: async function (username, password) {
      await api.repository.credential_password(
        username,
        password,
      )
    },
    send_key: async function (private_key, passphrase) {
      const log = fetch_log_store()

      const result = await api.ssl.generate_public_key(
        private_key,
        passphrase,
      )

      if (result.error) {
        log.warn(result.error)
        return
      }

      const { path: public_key } = result

      await api.repository.credential_key(
        private_key,
        public_key,
        passphrase,
      )
    },
  },
})
