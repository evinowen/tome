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
    clear: function (context) {
      context.commit('clear')
    },
    text: async function (context, value) {
      if (value) {
        return await window.api.clipboard.writetext(value)
      } else {
        return await window.api.clipboard.readtext()
      }
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

      await window.api.clipboard.paste(context.state.action, source, content.target)
    }
  }
}
