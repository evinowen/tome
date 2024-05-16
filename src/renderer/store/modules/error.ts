import { MutationTree, ActionTree } from 'vuex'
import api from '@/api'

export interface State {
  visible: boolean
  title: string
  message: string
  help: string
}

export const StateDefaults = (): State => ({
  visible: false,
  title: 'Default Title Message',
  message: 'Default Error Message',
  help: '',
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    show: function (state, { title, message, help }) {
      state.title = title
      state.message = message
      state.help = help
      state.visible = true
    },
    hide: function (state) {
      state.visible = false
    },
  },
  actions: <ActionTree<State, unknown>>{
    show: async function (context, state) {
      const { title, message, help } = state || {}

      context.commit('show', { title, message, help })
    },
    hide: async function (context) {
      context.commit('hide')
    },
    help: async function (context) {
      api.file.open(`https://tome.evinowen.net/help.html#${context.state.help}`, false)
    },
  },
}
