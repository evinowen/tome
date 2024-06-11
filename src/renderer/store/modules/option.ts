import { defineStore } from 'pinia'
import api from '@/api'

export interface State {
  visible: boolean
  title: string
  message: string
  question: string
  action?: () => Promise<void>
  help_tag: string
}

export const StateDefaults = (): State => ({
  visible: false,
  title: '',
  message: '',
  question: '',
  help_tag: '',
})

export function OptionHelpUrl (tag) {
  return `https://tome.evinowen.net/help.html#${tag}`
}

export const fetch_option_store = defineStore('option', {
  state: StateDefaults,
  actions: {
    show: async function (title, message, question, action, help?) {
      this.title = title
      this.message = message
      this.question = question
      this.action = action
      this.help_tag = help
      this.visible = true

      return `${title} - ${message}`
    },
    confirm: async function () {
      await this.hide()
      await this.action()
    },
    hide: async function () {
      this.visible = false
    },
    help: async function () {
      api.file.open(OptionHelpUrl(this.help_tag), false)
    },
  },
})
