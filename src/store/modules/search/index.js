import lunr from 'lunr'

export default {
  namespaced: true,
  state: {
    index: null,
    query: null,
    results: null,
    navigation: {
      target: 0,
      total: 0
    }
  },
  mutations: {
    clear: function (state) {
      state.query = null
      state.results = null
    },
    query: function (state, { query }) {
      state.query = query
    },
    results: function (state, { results }) {
      state.results = results
    },
    index: function (state, { index }) {
      state.index = index
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
    index: async function (context, { tree }) {
      const index = lunr(function () {
        this.ref('path')
        this.field('path')
        this.field('content')

        tree.documents.forEach(function (document) { this.add(document) }, this)
      })

      context.commit('index', { index })
      context.dispatch('execute')
    },
    query: async function (context, { query }) {
      context.commit('query', { query })
      context.dispatch('execute')
    },
    clear: async function (context) {
      context.commit('clear')
    },
    execute: async function (context) {
      if (!(context.state.index && context.state.query)) {
        return
      }

      const results = context.state.index.search(`*${context.state.query}*`)

      context.commit('results', { results })
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
