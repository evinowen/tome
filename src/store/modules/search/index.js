import lunr from 'lunr'

export default {
  namespaced: true,
  state: {
    index: null,
    query: null,
    results: null,
    visible: {
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
    visible: function (state, { target, total }) {
      state.visible.target = target || state.visible.target
      state.visible.total = total || state.visible.total

      if (state.visible.target < 1) {
        state.visible.target = state.visible.total
      } else if (state.visible.target > state.visible.total) {
        state.visible.target = 1
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
    visible: async function (context, { total, target }) {
      context.commit('visible', { total, target })
    },
    next: async function (context) {
      context.commit('visible', { target: context.state.visible.target + 1, total: null })
      console.log('next', context.state.visible)
    },
    previous: async function (context) {
      context.commit('visible', { target: context.state.visible.target - 1, total: null })
      console.log('previous', context.state.visible)
    }
  }
}
