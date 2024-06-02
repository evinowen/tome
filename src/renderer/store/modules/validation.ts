import { defineStore } from 'pinia'

export interface State {
  visible: boolean
  message: string
  element?: HTMLElement
}

export const StateDefaults = (): State => ({
  visible: false,
  message: '',
  element: undefined,
})

export const fetch_validation_store = defineStore('validation', {
  state: StateDefaults,
  actions: {
    show: async function (message, element) {
      this.message = message
      this.element = element
      this.visible = true
    },
    hide: async function (element) {
      if (this.element === element) {
        this.message = ''
        this.element = undefined
        this.visible = false
      }
    },
  },
})
