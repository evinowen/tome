import { MutationTree, ActionTree } from 'vuex'
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

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    set: function (state, data) {
      Object.assign(state, data)
    },
  },
  actions: <ActionTree<State, unknown>>{
    name: async function (context, value) {
      const name = value
      context.commit('set', { name })
    },
    email: async function (context, value) {
      const email = value
      context.commit('set', { email })
    },
    message: function (context, value) {
      const message = value || `Update for ${SignatureMessageDateString()}`
      context.commit('set', { message })
    },
    uncheck: function (context) {
      context.commit('set', { name_error: false })
      context.commit('set', { email_error: false })
    },
    check: function (context) {
      if (context.state.name.length === 0) {
        context.commit('set', { name_error: true })
      }

      if (context.state.email.length === 0) {
        context.commit('set', { email_error: true })
      }

      if (context.state.name_error || context.state.email_error) {
        return false
      }

      return true
    },
  },
}
