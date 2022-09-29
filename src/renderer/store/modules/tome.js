import { DateTime } from 'luxon'

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
      state.remote = null
      state.pending = []

      if (data === null) {
        return
      }

      const { remote, pending } = data

      state.remote = remote
      state.pending = pending
    },
    patches: function (state, data) {
      const { patches } = data

      state.patches = patches
    },
    metadata: function (state, data) {
      Object.assign(state.metadata, data)
    }
  },
  actions: {
    clear: async function (context) {
      context.commit('clear')
    },
    load: async function (context, path) {
      await context.dispatch('message', `Loading tome at ${path} ... `, { root: true })

      const repository = await window.api.repository.load(path)

      context.commit('initialize', repository)
      context.commit('load')

      await context.dispatch('inspect')

      await context.dispatch('signature/name')
      await context.dispatch('signature/email')
      await context.dispatch('signature/message')

      const passphrase = await context.dispatch('configuration/read', 'passphrase', { root: true })
      await context.dispatch('credentials/passphrase', passphrase)

      const key = await context.dispatch('configuration/read', 'private_key', { root: true })
      await context.dispatch('credentials/key', key)

      const remote = await context.dispatch('configuration/read', 'default_remote', { root: true })
      await context.dispatch('remote', remote)

      await context.dispatch('message', `${repository.name} ready`, { root: true })
    },
    stage: async function (context, query) {
      context.commit('staging', true)

      try {
        await context.dispatch('message', `Staging query ${query}`, { root: true })
        await window.api.repository.stage(query)

        await context.dispatch('inspect')
        await context.dispatch('message', 'Stage complete', { root: true })
      } catch (err) {
        await context.dispatch('error', 'Stage failed', { root: true })
        throw err
      } finally {
        context.commit('staging', false)
      }
    },
    reset: async function (context, query) {
      context.commit('staging', true)

      try {
        await context.dispatch('message', `Reseting query ${query}`, { root: true })
        await window.api.repository.reset(query)

        await context.dispatch('inspect')
        await context.dispatch('message', 'Reset complete', { root: true })
      } catch (err) {
        await context.dispatch('error', 'Reset failed', { root: true })
        throw err
      } finally {
        context.commit('staging', false)
      }
    },
    inspect: async function (context) {
      await window.api.repository.inspect()

      await context.dispatch('refresh')
    },
    refresh: async function (context) {
      const result = await window.api.repository.refresh()

      await context.commit('refresh', result)
    },
    diff: async function (context, data) {
      const { path, commit } = data

      if (path) {
        await window.api.repository.diff_path(path)
      } else if (commit) {
        await window.api.repository.diff_commit(commit)
      }

      const result = await window.api.repository.refresh_patches()
      context.commit('patches', result)
    },
    commit: async function (context) {
      context.commit('commit', true)

      const { name, email, message } = context.state.signature

      await context.dispatch('message', `Creating commit "${message}" ...`, { root: true })

      const oid = await window.api.repository.commit(name, email, message)

      await context.dispatch('message', `Commit "${message}" ${oid} created`, { root: true })

      await context.dispatch('inspect')

      while (context.state.staging) {
        context.commit('staging', false)
      }

      context.commit('commit', false)
    },
    remote: async function (context, name) {
      await window.api.repository.clear_remote()
      context.commit('remote', null)

      if (!name) {
        return
      }

      const { key: private_key, passphrase } = context.state.credentials

      if (!private_key) {
        return
      }

      const { path: public_key } = await window.api.ssl.generate_public_key(private_key, passphrase)

      await window.api.repository.credential(private_key, public_key, passphrase)

      const remote = context.state.remotes.find((remote) => remote.name === name)
      await window.api.repository.load_remote_url(remote.url)

      const result = await window.api.repository.remote()
      context.commit('remote', result)
    },
    push: async function (context) {
      const { key: private_key, passphrase } = context.state.credentials
      const { path: public_key } = await window.api.ssl.generate_public_key(private_key, passphrase)

      await window.api.repository.credential(private_key, public_key, passphrase)

      context.commit('push', true)

      await context.dispatch('message', `Pushing to remote ${context.state.remote.name} ...`, { root: true })

      await window.api.repository.push()

      await context.dispatch('message', `Push to remote ${context.state.remote.name} complete`, { root: true })

      context.commit('push', false)
    },
    metadata: function (context, data) {
      context.commit('metadata', data)
    },
    staging: function (context, advance) {
      context.commit('staging', advance)
    }
  },
  modules: {
    credentials: {
      namespaced: true,
      state: {
        key: null,
        passphrase: null
      },
      mutations: {
        set: function (state, data) {
          for (const key in data) {
            state[key] = data[key]
          }
        }
      },
      actions: {
        key: async function (context, value) {
          context.commit('set', { key: value })
        },
        passphrase: async function (context, value) {
          context.commit('set', { passphrase: value })
        }
      }
    },
    signature: {
      namespaced: true,
      state: {
        name: null,
        email: null,
        message: null
      },
      mutations: {
        set: function (state, data) {
          for (const key in data) {
            state[key] = data[key]
          }
        }
      },
      actions: {
        name: async function (context, value) {
          const name = value || await context.dispatch('configuration/read', 'name', { root: true })
          context.commit('set', { name })
        },
        email: async function (context, value) {
          const email = value || await context.dispatch('configuration/read', 'email', { root: true })
          context.commit('set', { email })
        },
        message: function (context, value) {
          const message = value || `Update for ${DateTime.now().toISODate()}`
          context.commit('set', { message })
        }
      }
    }
  }
}
