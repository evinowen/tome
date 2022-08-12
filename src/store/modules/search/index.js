export default {
  namespaced: true,
  state: {
    path: null,
    query: null,
    results: [],
    navigation: {
      target: 1,
      total: 0
    }
  },
  mutations: {
    clear: function (state) {
      state.query = null
      state.results = []
    },
    query: function (state, { path, query }) {
      state.path = path
      state.query = query
    },
    reset: function (state) {
      state.results.length = 0
    },
    result: function (state, result) {
      state.results.push(result)
    },
    navigate: function (state, { target, total }) {
      state.navigation.target = Number.isInteger(target) ? target : state.navigation.target
      state.navigation.total = Number.isInteger(total) ? total : state.navigation.total

      if (state.navigation.target < 1) {
        state.navigation.target = state.navigation.total
      } else if (state.navigation.target > state.navigation.total) {
        state.navigation.target = 1
      }
    }
  },
  actions: {
    query: async function (context, { path, query }) {
      context.commit('query', { path, query })
      await context.dispatch('execute')
    },
    clear: async function (context) {
      context.commit('clear')
    },
    execute: async function (context) {
      if (!(context.state.path && context.state.query)) {
        return
      }

      context.commit('reset')

      const target = context.state.path
      const query = context.state.query

      await window.api.search_path(target, query)

      while (true) {
        const result = await window.api.search_next()

        if (result.path === null) {
          break
        }

        if (target !== context.state.path) {
          break
        }

        if (query !== context.state.query) {
          break
        }

        if (result.matches.length) {
          context.commit('result', result)
        }
      }
    },
    navigate: async function (context, { total, target }) {
      context.commit('navigate', { total, target })
    },
    next: async function (context) {
      context.commit('navigate', { target: context.state.navigation.target + 1, total: null })
    },
    previous: async function (context) {
      context.commit('navigate', { target: context.state.navigation.target - 1, total: null })
    }
  }
}
