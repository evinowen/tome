import { MutationTree, ActionTree } from 'vuex'
import { DateTime } from 'luxon'

class RepositoryNotLoadedError extends Error {}
class RepositoryRemoteNotLoadedError extends Error {}
class RepositoryRemoteNotFoundError extends Error {}

interface RepositoryPayload {
  name: string,
  path: string,
  history: { oid: string, date: Date, message: string }[],
  branch?: string,
  remotes: { name: string, url: string }[],
  available: { path: string, type: number }[],
  staged: { path: string, type: number }[]
}

interface RepositoryStatus {
  available: { path: string, type: number }[]
  staged: { path: string, type: number }[]
}

interface RepositoryMetadata {
  readme?: string
  license?: string
  authors?: string
  contributors?: string
}

interface RepositoryPatches {
  name: string
  path: string
  lines: { type: number, line: string }[]
}

export interface State {
  name: string
  path: string
  branch?: string
  history: { oid: string, date: Date, message: string }[]
  pending: { oid: string, date: Date, message: string }[]
  patches: RepositoryPatches[]
  remotes: { name: string, url: string }[]
  loaded: boolean
  staging: number
  status: RepositoryStatus
  remote?: { name: string, url: string }
  repository?: RepositoryPayload
  metadata: RepositoryMetadata
  commit_working: boolean
  push_working: boolean
  credentials: CredentialState
  signature: SignatureState
}

export interface CredentialState {
  key?: string
  passphrase?: string
}

export interface SignatureState {
  name?: string
  email?: string
  message?: string
}

function InitialState (): State {
  return <State>{
    name: '',
    path: '',
    branch: undefined,
    history: [],
    pending: [],
    patches: [],
    remotes: [],
    loaded: false,
    staging: 0,
    status: { available: [], staged: [] },
    remote: undefined,
    repository: undefined,
    metadata: {
      readme: undefined,
      license: undefined,
      authors: undefined,
      contributors: undefined,
    },
    commit_working: false,
    push_working: false
  }
}

export default {
  namespaced: true,
  state: InitialState(),
  mutations: <MutationTree<State>>{
    clear: function (state) {
      Object.assign(state, InitialState())
    },
    initialize: function (state, repository) {
      state.repository = repository
    },
    load: function (state) {
      if (state.repository === undefined) {
        throw new RepositoryNotLoadedError()
      }

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
    remote: function (state, remote) {
      state.remote = remote
    },
    patches: function (state, data) {
      const { patches } = data

      state.patches = patches
    },
    metadata: function (state, data) {
      Object.assign(state.metadata, data)
    }
  },
  actions: <ActionTree<State, unknown>>{
    clear: async function (context) {
      context.commit('clear')
    },
    load: async function (context, path) {
      await context.dispatch('message', `Loading repository at ${path} ... `, { root: true })

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
      } catch (error) {
        await context.dispatch('error', 'Stage failed', { root: true })
        throw error
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
      } catch (error) {
        await context.dispatch('error', 'Reset failed', { root: true })
        throw error
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
      context.commit('remote')

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

      if (!remote) {
        throw new RepositoryRemoteNotFoundError()
      }

      await window.api.repository.load_remote_url(remote.url)

      const result = await window.api.repository.remote()
      context.commit('remote', result)
    },
    push: async function (context) {
      if (context.state.remote === undefined) {
        throw new RepositoryRemoteNotLoadedError()
      }

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
      state: <CredentialState>{
        key: undefined,
        passphrase: undefined
      },
      mutations: <MutationTree<CredentialState>>{
        set: function (state, data) {
          Object.assign(state, data)
        }
      },
      actions: <ActionTree<CredentialState, unknown>>{
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
      state: <SignatureState>{
        name: undefined,
        email: undefined,
        message: undefined
      },
      mutations: <MutationTree<SignatureState>>{
        set: function (state, data) {
          Object.assign(state, data)
        }
      },
      actions: <ActionTree<SignatureState, unknown>>{
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
