import { defineStore } from 'pinia'
import api from '@/api'

export interface State {
  error: string
  action: string
  content: { type: string, target: string }
}

export const StateDefaults = (): State => ({
  error: '',
  action: '',
  content: {
    type: '',
    target: '',
  },
})

export const fetch_clipboard_store = defineStore('clipboard', {
  state: StateDefaults,
  actions: {
    clear: function () {
      this.$reset()
    },
    text: async function (value) {
      return value
        ? await api.clipboard.writetext(value)
        : await api.clipboard.readtext()
    },
    cut: async function (content) {
      this.action = 'cut'
      this.content = content
    },
    copy: async function (content) {
      this.action = 'copy'
      this.content = content
    },
    paste: async function (content) {
      if (!this.content.type) {
        this.error = 'No content'
        return
      }

      const source = this.content.target

      await api.clipboard.paste(this.action || '', source, content.target)
    },
  },
})
