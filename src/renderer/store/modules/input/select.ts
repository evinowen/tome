import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export interface Option {
  value: string
  label: string
  detail?: string
}

export interface State {
  identifier: string
  visible: boolean
  element?: HTMLElement
  options?: Option[]
  active?: Option[]
  set?: (option: Option) => Promise<void>
}

export const StateDefaults = (): State => ({
  identifier: '',
  visible: false,
  element: undefined,
  options: [],
  active: [],
  set: undefined,
})

export const fetch_input_select_store = defineStore('input-select', {
  state: StateDefaults,
  actions: {
    show: async function ({ element, set, options }) {
      this.identifier = uuidv4().toString()
      this.element = element
      this.set = set
      this.options = options
      this.active = options
      this.visible = true

      return this.identifier
    },
    filter: async function ({ identifier, value }) {
      if (this.identifier !== identifier) {
        return
      }

      this.active = this.options.filter((option) => {
        if (typeof value !== 'string' || value === '') {
          return true
        }

        const value_lowercase = value.toLowerCase()

        if (option.value.toLowerCase().includes(value_lowercase)) {
          return true
        }

        if (option.label.toLowerCase().includes(value_lowercase)) {
          return true
        }

        return false
      })
    },
    select: async function (state) {
      const { identifier, option }: { identifier: string, option: Option } = state
      if (this.identifier !== identifier) {
        return
      }

      await this.set(option)
      await this.hide(state)
    },
    hide: async function ({ identifier }) {
      if (this.identifier !== identifier) {
        return
      }

      this.identifier = ''
      this.visible = false
    },
    close: async function () {
      this.identifier = ''
      this.visible = false
    },
  },
})
