import { MutationTree, ActionTree } from 'vuex'

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

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    show: function (state, { message, element }) {
      state.message = message
      state.element = element
      state.visible = true
    },
    hide: function (state, { element }) {
      if (state.element === element) {
        state.message = ''
        state.element = undefined
        state.visible = false
      }
    },
  },
  actions: <ActionTree<State, unknown>>{
    show: async function (context, state) {
      const { message, element } = state || {}

      context.commit('show', { message, element })
    },
    hide: async function (context, state) {
      const { element } = state || {}

      context.commit('hide', { element })
    },
  },
}
