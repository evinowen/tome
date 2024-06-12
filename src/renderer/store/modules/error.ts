import { defineStore } from 'pinia'
import api from '@/api'

export interface State {
  visible: boolean
  title: string
  message: string
  help_tag: string
}

export const StateDefaults = (): State => ({
  visible: false,
  title: '',
  message: '',
  help_tag: '',
})

export function ErrorHelpUrl (tag) {
  return `https://tome.evinowen.net/help.html#${tag}`
}

export const fetch_error_store = defineStore('error', {
  state: StateDefaults,
  actions: {
    show: async function (title, message, help?) {
      this.title = title
      this.message = message
      this.help_tag = help
      this.visible = true

      return `${title} - ${message}`
    },
    hide: async function () {
      this.visible = false
    },
    help: async function () {
      api.file.open(ErrorHelpUrl(this.help_tag), false)
    },
  },
})
