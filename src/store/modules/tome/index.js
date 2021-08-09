import Repository from './Repository'

const reset = () => ({
  name: '',
  path: '',
  branch: '',
  history: [],
  patches: [],
  remotes: [],
  pending: [],
  loaded: false,
  staging: 0,
  status: {
    available: [],
    staged: []
  },
  signature: {
    email: '',
    name: ''
  },
  message: '',
  remote: null,
  repository: null,
  metadata: {
    readme: null,
    license: null,
    authors: null,
    contributors: null
  },
  commit_working: false,
  push_working: false
})

export default {
  namespaced: true,
  state: reset(),
  mutations: {
    clear: function (state, path) {
      Object.assign(state, reset())
    },
    initialize: function (state, path) {
      state.repository = new Repository(path)
    },
    load: function (state) {
      state.name = state.repository.name
      state.path = state.repository.path
      state.history = state.repository.history
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
    staging: function (state, advance) {
      if (advance) {
        state.staging++
      } else {
        state.staging--
      }
    },
    commit: function (state, flag) {
      state.commit_working = flag
    },
    push: function (state, flag) {
      state.push_working = flag
    },
    remote: function (state) {
      state.remote = state.repository.remote
      state.pending = state.repository.pending
    },
    patches: function (state) {
      state.patches = state.repository.patches
    },
    metadata: function (state, data) {
      Object.assign(state.metadata, data)
    },
    signature: function (state, data) {
      const { name, email } = data

      state.signature.name = name
      state.signature.email = email
    },
    message: function (state, message) {
      state.message = message
    }
  },
  actions: {
    clear: async function (context) {
      context.commit('clear')
    },
    load: async function (context, path) {
      context.commit('initialize', path)

      await context.state.repository.load()

      context.commit('load')

      await context.dispatch('inspect')
    },
    stage: async function (context, query) {
      await context.state.repository.stage(query)

      await context.dispatch('inspect')
    },
    reset: async function (context, query) {
      await context.state.repository.reset(query)

      await context.dispatch('inspect')
    },
    inspect: async function (context) {
      await context.state.repository.inspect()

      context.commit('refresh')
    },
    diff: async function (context, data) {
      const { path, commit } = data

      if (path) {
        await context.state.repository.diffPath(path)
      } else if (commit) {
        await context.state.repository.diffCommit(commit)
      }

      context.commit('patches')
    },
    commit: async function (context) {
      context.commit('commit', true)

      const { name, email } = context.state.signature
      const message = context.state.message

      await context.dispatch('message', `Creating commit "${message}" ...`, { root: true })
      const oid = await context.state.repository.commit(name, email, message)
      await context.dispatch('message', `Commit "${message}" ${oid} created`, { root: true })

      await context.dispatch('inspect')

      while (context.state.staging) {
        context.commit('staging', false)
      }

      context.commit('commit', false)
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
      context.commit('push', true)

      await context.dispatch('message', `Pushing to remote ${context.state.remote.name} ...`, { root: true })
      await context.state.repository.push()
      await context.dispatch('message', `Push to remote ${context.state.remote.name} complete`, { root: true })

      context.commit('push', false)
    },
    metadata: function (context, data) {
      context.commit('metadata', data)
    },
    signature: function (context, data) {
      context.commit('signature', data)
    },
    message: function (context, message) {
      context.commit('message', message)
    },
    staging: function (context, advance) {
      context.commit('staging', advance)
    }
  }
}
