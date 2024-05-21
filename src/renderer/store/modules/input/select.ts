import { MutationTree, ActionTree } from 'vuex'
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

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    show: function (state, { element, set, options }) {
      state.identifier = uuidv4().toString()
      state.element = element
      state.set = set
      state.options = options
      state.active = options
      state.visible = true
    },
    filter: function (state, { identifier, value }) {
      if (state.identifier !== identifier) {
        return
      }

      state.active = state.options.filter((option) => {
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
    hide: function (state, { identifier }) {
      if (state.identifier !== identifier) {
        return
      }

      state.identifier = ''
      state.visible = false
    },
    close: function (state) {
      state.identifier = ''
      state.visible = false
    },
  },
  actions: <ActionTree<State, unknown>>{
    show: async function (context, state) {
      context.commit('show', state)

      return context.state.identifier
    },
    filter: async function (context, state) {
      context.commit('filter', state)
    },
    set: async function (context, state) {
      const { identifier, option }: { identifier: string, option: Option } = state
      if (context.state.identifier !== identifier) {
        return
      }

      await context.state.set(option)
      await context.dispatch('hide', state)
    },
    hide: async function (context, state) {
      context.commit('hide', state)
    },
    close: async function (context) {
      context.commit('close')
    },
  },
}
