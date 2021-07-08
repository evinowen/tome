import Repository from './Repository'

export default {
  namespaced: true,
  state: {
    name: '',
    path: '',
    branch: '',
    remotes: [],
    pending: [],
    loaded: false,
    status: {
      available: [],
      staged: []
    },
    remote: null,
    repository: null
  },
  mutations: {
    initialize: function (state, path) {
      state.repository = new Repository(path)
    },
    load: function (state) {
      state.name = state.repository.name
      state.path = state.repository.path
      state.branch = state.repository.branch
      state.remotes = state.repository.remotes

      state.status.available = []
      state.status.staged = []

      state.loaded = true
    },
    refresh: function (state) {
      state.status.available = state.repository.available
      state.status.staged = state.repository.staged
    },
    remote: function (state) {
      state.remote = state.repository.remote
      state.pending = state.repository.pending
    }
  },
  actions: {
    load: async function (context, path) {
      context.commit('initialize', path)

      await context.state.repository.load()

      context.commit('load')

      await context.dispatch('inspect')
    },
    stage: async function (context, path) {
      await context.state.repository.stagePath(path)

      await context.dispatch('inspect')
    },
    reset: async function (context, path) {
      await context.state.repository.resetPath(path)

      await context.dispatch('inspect')
    },
    inspect: async function (context) {
      await context.state.repository.inspect()

      context.commit('refresh')
    },
    commit: async function (context, name, email, message) {
      await context.state.repository.commit(name, email, message)

      await context.dispatch('inspect')
    },
    credentials: async function (context, credentials) {
      const { private_key, public_key, passphrase } = credentials

      context.state.repository.storeCredentials(private_key, public_key, passphrase)
    },
    remote: async function (context, url) {
      await context.state.repository.loadRemoteBranch(url)

      context.commit('remote')
    },
    push: async function (context) {
      await context.state.repository.push()
    }
  }
}
