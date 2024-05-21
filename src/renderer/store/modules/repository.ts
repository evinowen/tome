import { MutationTree, ActionTree } from 'vuex'
import { DateTime } from 'luxon'
import api from '@/api'

class RepositoryNotLoadedError extends Error {}
class RepositoryRemoteNotLoadedError extends Error {}
class RepositoryRemoteNotFoundError extends Error {}

export interface RepositoryCommit {
  oid: string
  date: Date
  message: string
}

interface RepositoryPayload {
  name: string
  path: string
  history: RepositoryCommit[]
  branch?: string
  remotes: { name: string, url: string }[]
  available: { path: string, type: number }[]
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

export interface RepositoryRemote {
  name: string
  url: string
}

export interface State {
  name: string
  path: string
  branch?: string
  history: RepositoryCommit[]
  pending: RepositoryCommit[]
  patches: RepositoryPatches[]
  patches_type: string
  patches_reference: string
  patches_message: string
  loaded: boolean
  staging: number
  status: RepositoryStatus
  remote: { name: string, url: string, branch: { name: string, short: string, error: string } }
  repository?: RepositoryPayload
  metadata: RepositoryMetadata
  commit_working: boolean
  push_working: boolean
  credentials?: CredentialState
  remotes?: RemotesState
  signature?: SignatureState
}

export interface CredentialState {
  type?: string
  username?: string
  password?: string
  key?: string
  passphrase?: string
}

export interface RemotesState {
  list: RepositoryRemote[]
}

export interface SignatureState {
  name?: string
  name_error?: boolean
  email?: string
  email_error?: boolean
  message?: string
}

export const StateDefaults = (): State => ({
  name: '',
  path: '',
  branch: undefined,
  history: [],
  pending: [],
  patches: [],
  patches_type: '',
  patches_reference: '',
  patches_message: '',
  loaded: false,
  staging: 0,
  status: { available: [], staged: [] },
  remote: { name: '', url: '', branch: { name: '', short: '', error: '' } },
  repository: undefined,
  metadata: {
    readme: undefined,
    license: undefined,
    authors: undefined,
    contributors: undefined,
  },
  commit_working: false,
  push_working: false,
})

export const CredentialStateDefaults = (): CredentialState => ({
  type: '',
  username: undefined,
  password: undefined,
  key: undefined,
  passphrase: undefined,
})

export const RemotesStateDefaults = (): RemotesState => ({
  list: [],
})

export const SignatureStateDefaults = (): SignatureState => ({
  name: '',
  name_error: false,
  email: '',
  email_error: false,
  message: '',
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    clear: function (state) {
      Object.assign(state, StateDefaults())
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
      state.remote = data.remote
      state.remote.branch = data.branch
    },
    pending: function (state, pending) {
      state.pending = pending
    },
    patches: function (state, data) {
      const { type, reference, patches, message } = data

      state.patches = patches
      state.patches_type = type
      state.patches_reference = reference
      state.patches_message = message
    },
    metadata: function (state, data) {
      Object.assign(state.metadata, data)
    },
  },
  actions: <ActionTree<State, unknown>>{
    clear: async function (context) {
      context.commit('clear')
    },
    load: async function (context, path) {
      await context.dispatch('log', { level: 'info', message: `Loading repository at ${path} ... ` }, { root: true })

      const repository = await api.repository.load(path)

      context.commit('initialize', repository)
      context.commit('load')
      await context.dispatch('remotes/load')
      await context.dispatch('credentials/load')

      await context.dispatch('inspect')

      await context.dispatch('signature/name')
      await context.dispatch('signature/email')
      await context.dispatch('signature/message')

      const remote = await context.dispatch('configuration/read', 'default_remote', { root: true })
      await context.dispatch('remote', remote)

      await context.dispatch('log', { level: 'info', message: `Repository ${repository.name} ready` }, { root: true })
    },
    loaded: async function (context) {
      return context.state.loaded
    },
    stage: async function (context, query) {
      context.commit('staging', true)

      try {
        await context.dispatch('log', { level: 'info', message: `Staging query ${query}` }, { root: true })
        await api.repository.stage(query)

        await context.dispatch('inspect')
        await context.dispatch('log', { level: 'info', message: 'Stage complete' }, { root: true })
      } catch (error) {
        await context.dispatch('log', { level: 'error', message: 'Stage failed' }, { root: true })
        throw error
      } finally {
        context.commit('staging', false)
      }
    },
    staged: async function (context) {
      return context.state.status.staged.length > 0
    },
    reset: async function (context, query) {
      context.commit('staging', true)

      try {
        await context.dispatch('log', { level: 'info', message: `Reseting query ${query}` }, { root: true })
        await api.repository.reset(query)

        await context.dispatch('inspect')
        await context.dispatch('log', { level: 'info', message: 'Reset complete' }, { root: true })
      } catch (error) {
        await context.dispatch('log', { level: 'error', message: 'Reset failed' }, { root: true })
        throw error
      } finally {
        context.commit('staging', false)
      }
    },
    inspect: async function (context) {
      await api.repository.inspect()

      await context.dispatch('refresh')
    },
    refresh: async function (context) {
      const result = await api.repository.refresh()

      await context.commit('refresh', result)
    },
    diff: async function (context, data) {
      const { path, commit } = data

      let type = ''
      let reference = ''
      let message = ''

      if (path) {
        type = 'patch'
        reference = path
        await api.repository.diff_path(path)
      } else if (commit) {
        type = 'commit'
        reference = String(commit).toLowerCase()

        for (const item of context.state.history) {
          if (item.oid === commit) {
            message = item.message
            break
          }
        }

        await api.repository.diff_commit(commit)
      }

      const { patches } = await api.repository.refresh_patches()
      context.commit('patches', { type, reference, patches, message })
    },
    commit: async function (context) {
      context.commit('commit', true)

      const { name, email, message } = context.state.signature

      await context.dispatch('log', { level: 'info', message: `Creating commit "${message}" ...` }, { root: true })

      const oid = await api.repository.commit(name, email, message)

      await context.dispatch('log', { level: 'info', message: `Commit "${message}" ${oid} created` }, { root: true })

      await context.dispatch('inspect')

      while (context.state.staging) {
        context.commit('staging', false)
      }

      context.commit('commit', false)
    },
    remote: async function (context, name) {
      await api.repository.clear_remote()
      context.commit('remote', { remote: { name: '', url: '' }, branch: { name: '', short: '' } })

      if (!name) {
        return
      }

      await context.dispatch('credentials/load')

      const remote = context.state.remotes.list.find((remote) => remote.name === name)

      if (!remote) {
        throw new RepositoryRemoteNotFoundError()
      }

      await api.repository.load_remote_url(remote.url)

      const result = await api.repository.remote()
      context.commit('remote', { remote: result.remote, branch: result.branch })
      context.commit('pending', result.pending)
    },
    push: async function (context) {
      if (context.state.remote === undefined) {
        throw new RepositoryRemoteNotLoadedError()
      }

      await context.dispatch('credentials/load')

      context.commit('push', true)

      await context.dispatch('log', { level: 'info', message: `Pushing to remote ${context.state.remote.name} ...` }, { root: true })

      await api.repository.push()

      await context.dispatch('log', { level: 'info', message: `Push to remote ${context.state.remote.name} complete` }, { root: true })

      context.commit('push', false)
    },
    metadata: function (context, data) {
      context.commit('metadata', data)
    },
    staging: function (context, advance) {
      context.commit('staging', advance)
    },
  },
  modules: {
    credentials: {
      namespaced: true,
      state: CredentialStateDefaults,
      mutations: <MutationTree<CredentialState>>{
        set: function (state, data) {
          Object.assign(state, data)
        },
      },
      actions: <ActionTree<CredentialState, unknown>>{
        load: async function (context) {
          const type = await context.dispatch('configuration/read', 'credential_type', { root: true })
          const username = await context.dispatch('configuration/read', 'username', { root: true })
          const password = await context.dispatch('configuration/read', 'password', { root: true })
          const key = await context.dispatch('configuration/read', 'private_key', { root: true })
          const passphrase = await context.dispatch('configuration/read', 'passphrase', { root: true })

          context.commit('set', {
            type,
            username,
            password,
            key,
            passphrase,
          })

          switch (context.state.type) {
            case 'password': {
              const { username, password } = context.state
              await api.repository.credential_password(username, password)
              break
            }

            case 'key': {
              const { key: private_key, passphrase } = context.state
              const { path: public_key } = await api.ssl.generate_public_key(private_key, passphrase)
              await api.repository.credential_key(private_key, public_key, passphrase)
              break
            }
          }
        },
        key: async function (context, value) {
          context.commit('set', { key: value })
        },
        passphrase: async function (context, value) {
          context.commit('set', { passphrase: value })
        },
      },
    },
    remotes: {
      namespaced: true,
      state: RemotesStateDefaults,
      mutations: <MutationTree<RemotesState>>{
        load: function (state, list) {
          state.list = list
        },
      },
      actions: <ActionTree<RemotesState, unknown>>{
        load: async function (context) {
          const list = await api.repository.remote_list()
          context.commit('load', list)
        },
        add: async function (context, state) {
          const { name, url } = state
          await api.repository.remote_add(name, url)
          await context.dispatch('load')
        },
        remove: async function (context, state) {
          const { name } = state
          await api.repository.remote_remove(name)
          await context.dispatch('load')
        },
      },
    },
    signature: {
      namespaced: true,
      state: SignatureStateDefaults,
      mutations: <MutationTree<SignatureState>>{
        set: function (state, data) {
          Object.assign(state, data)
        },
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
          // eslint-disable-next-line unicorn/consistent-function-scoping
          const date = () => {
            return DateTime.now().toLocaleString({
              weekday: 'short',
              month: 'long',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short',
            })
          }

          const message = value || `Update for ${date()}`
          context.commit('set', { message })
        },
        uncheck: function (context) {
          context.commit('set', { name_error: false })
          context.commit('set', { email_error: false })
        },
        check: function (context) {
          if (context.state.name.length === 0) {
            context.commit('set', { name_error: true })
            return false
          }

          if (context.state.email.length === 0) {
            context.commit('set', { email_error: true })
            return false
          }

          return true
        },
      },
    },
  },
}
