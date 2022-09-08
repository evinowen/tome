export default {
  namespaced: true,
  state: {
    error: null,
    action: null,
    content: null
  },
  mutations: {
    set: function (state, data) {
      const { action, content } = data

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
  actions: {
    text: async function (context, value) {
      await window.api.clipboard_text(value)
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

      await window.api.clipboard_paste(context.state.action, source, content.target)
    }
  }
}
