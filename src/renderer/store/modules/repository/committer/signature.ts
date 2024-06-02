import { defineStore } from 'pinia'
import { DateTime } from 'luxon'

export interface State {
  name?: string
  name_error?: boolean
  email?: string
  email_error?: boolean
  message?: string
}

export const StateDefaults = (): State => ({
  name: '',
  name_error: false,
  email: '',
  email_error: false,
  message: '',
})

const SignatureMessageDateString = () =>
  DateTime.now().toLocaleString({
    weekday: 'short',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

export const fetch_repository_committer_signature_store = defineStore('repository-committer-signature', {
  state: StateDefaults,
  actions: {
    sign_name: async function (value?) {
      this.name = value || ''
    },
    sign_email: async function (value?) {
      this.email = value || ''
    },
    sign_message: function (value?) {
      this.message = value || `Update for ${SignatureMessageDateString()}`
    },
    uncheck: function () {
      this.name_error = false
      this.email_error = false
    },
    check: function () {
      if (this.name.length === 0) {
        this.name_error = true
      }

      if (this.email.length === 0) {
        this.email_error = true
      }

      if (this.name_error || this.email_error) {
        return false
      }

      return true
    },
  },
})
