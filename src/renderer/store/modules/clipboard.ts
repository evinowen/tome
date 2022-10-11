import { MutationTree, ActionTree } from 'vuex'

export class State {
  error: string|null = null
  action: string|null = null
  content: { type: string, target: string }|null = null
}

export default {
  namespaced: true,
  state: new State,
  mutations: <MutationTree<State>>{
    set: function (state, data) {
      const { action, content } = data
1
      state.action = action
      state.content = content
    },
    clear: function (state) {
      state.action = null
      state.content = null
    },
    error: function (state, data) {
      const { message } = data
      state.error = message
    }
  },
  actions: <ActionTree<State, any>>{
    clear: function (context) {
      context.commit('clear')
    },
    text: async function (context, value) {
      return value
        ? await window.api.clipboard.writetext(value)
        : await window.api.clipboard.readtext()
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
      if (!context.state.content) {
        context.commit('error', { message: 'No content' })
        return
      }

      const source = context.state.content.target

      await window.api.clipboard.paste(context.state.action || '', source, content.target)
    }
  }
}
