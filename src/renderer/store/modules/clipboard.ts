import { MutationTree, ActionTree } from 'vuex'
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

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    set: function (state, data) {
      const { action, content } = data
1
      state.action = action
      state.content = content
    },
    clear: function (state) {
      Object.assign(state, StateDefaults())
    },
    error: function (state, data) {
      const { message } = data
      state.error = message
    }
  },
  actions: <ActionTree<State, unknown>>{
    clear: function (context) {
      context.commit('clear')
    },
    text: async function (context, value) {
      return value
        ? await api.clipboard.writetext(value)
        : await api.clipboard.readtext()
    },
    cut: async function (context, content) {
      context.commit('set', {
        action: 'cut',
        content
      })
    },
    copy: async function (context, content) {
      context.commit('set', {
        action: 'copy',
        content
      })
    },
    paste: async function (context, content) {
      if (!context.state.content.type) {
        context.commit('error', { message: 'No content' })
        return
      }

      const source = context.state.content.target

      await api.clipboard.paste(context.state.action || '', source, content.target)
    }
  }
}
