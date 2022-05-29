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
    initialize: function (state, repository) {
      state.repository = repository
    },
    load: function (state) {
      state.name = state.repository.name
      state.path = state.repository.path
      state.history = state.repository.history
      state.branch = state.repository.branch
      state.remotes = state.repository.remotes

      state.loaded = true
    },
    refresh: function (state, data) {
      const { available, staged } = data
      state.status.available = available
      state.status.staged = staged
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
    remote: function (state, data) {
      const { remote, pending } = data

      state.remote = remote
      state.pending = pending
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
      const repository = await window.api.load_repository(path)
      console.log(repository)

      context.commit('initialize', repository)
      context.commit('load')

      await context.dispatch('inspect')
    },
    stage: async function (context, query) {
      context.commit('staging', true)

      // try {
      //   await context.state.repository.stage(query, async (type, path) => {
      //     let wording
      //     if (type === 'add') {
      //       wording = 'as addition'
      //     } else if (type === 'remove') {
      //       wording = 'as removal'
      //     }

      //     await context.dispatch('message', `Staging path ${path} ${wording}`, { root: true })
      //   })

      //   await context.dispatch('inspect')
      //   await context.dispatch('message', 'Stage complete', { root: true })
      // } catch (err) {
      //   await context.dispatch('error', 'Stage failed', { root: true })
      //   throw err
      // } finally {
      //   context.commit('staging', false)
      // }
    },
    reset: async function (context, query) {
      context.commit('staging', true)

      // try {
      //   await context.state.repository.reset(query, async (type, path) => {
      //     await context.dispatch('message', `Reseting path ${path}`, { root: true })
      //   })

      //   await context.dispatch('inspect')
      //   await context.dispatch('message', 'Reset complete', { root: true })
      // } catch (err) {
      //   await context.dispatch('error', 'Reset failed', { root: true })
      //   throw err
      // } finally {
      //   context.commit('staging', false)
      // }
    },
    inspect: async function (context) {
      // await context.state.repository.inspect()
      await window.api.inspect_repository()

      await context.dispatch('refresh')
    },
    refresh: async function (context) {
      const result = await window.api.refresh_repository()

      await context.commit('refresh', result)
    },
    diff: async function (context, data) {
      const { path, commit } = data

      if (path) {
        // await context.state.repository.diffPath(path)
        await window.api.diff_path_repository(path)
      } else if (commit) {
        // await context.state.repository.diffCommit(commit)
        await window.api.diff_commit_repository(commit)
      }

      context.commit('patches')
    },
    commit: async function (context) {
      context.commit('commit', true)

      // const { name, email } = context.state.signature
      const message = context.state.message

      await context.dispatch('message', `Creating commit "${message}" ...`, { root: true })
      // const oid = await context.state.repository.commit(name, email, message)
      // await context.dispatch('message', `Commit "${message}" ${oid} created`, { root: true })

      await context.dispatch('inspect')

      while (context.state.staging) {
        context.commit('staging', false)
      }

      context.commit('commit', false)
    },
    credentials: async function (context, credentials) {
      const { private_key, public_key, passphrase } = credentials

      // context.state.repository.storeCredentials(private_key, public_key, passphrase)
      await window.api.credential_repository(private_key, public_key, passphrase)
    },
    remote: async function (context, url) {
      // await context.state.repository.loadRemoteBranch(url)
      await window.api.load_remote_url_repository(url)

      const result = await window.api.remote_repository()
      context.commit('remote', result)
    },
    push: async function (context) {
      context.commit('push', true)

      await context.dispatch('message', `Pushing to remote ${context.state.remote.name} ...`, { root: true })
      // await context.state.repository.push()
      await window.api.push_repository()
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
