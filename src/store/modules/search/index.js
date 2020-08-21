export default {
  namespaced: true,
  state: {
    query: null
  },
  mutations: {
    clear: function (state) {
      state.query = null
    },
    query: function (state, { query }) {
      state.query = query
    }
  },
  actions: {
    query: async function (context, { query }) {
      context.commit('query', { query })
    },
    clear: async function (context) {
      context.commit('clear')
    }
  }
}
