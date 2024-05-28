import { MutationTree, ActionTree } from 'vuex'
import branches, { State as BranchesState } from './repository/branches'
import committer, { State as CommitterState } from './repository/committer'
import comparator, { State as ComparatorState } from './repository/comparator'
import credentials, { State as CredentialsState } from './repository/credentials'
import history, { State as HistoryState } from './repository/history'
import remotes, { State as RemotesState } from './repository/remotes'
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
  remotes: { name: string, url: string }[]
  available: { path: string, type: number }[]
  staged: { path: string, type: number }[]
}

interface RepositoryMetadata {
  readme?: string
  license?: string
  authors?: string
  contributors?: string
}

export interface State {
  name: string
  path: string
  pending: RepositoryCommit[]
  loaded: boolean
  remote: { name: string, url: string, branch: { name: string, short: string, error: string } }
  repository?: RepositoryPayload
  metadata: RepositoryMetadata
  push_working: boolean

  branches?: BranchesState
  committer?: CommitterState
  comparator?: ComparatorState
  credentials?: CredentialsState
  history?: HistoryState
  remotes?: RemotesState
}

export const StateDefaults = (): State => ({
  name: '',
  path: '',
  pending: [],
  loaded: false,
  remote: { name: '', url: '', branch: { name: '', short: '', error: '' } },
  repository: undefined,
  metadata: {
    readme: undefined,
    license: undefined,
    authors: undefined,
    contributors: undefined,
  },
  push_working: false,
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

      state.loaded = true
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

      await context.dispatch('branches/load')

      context.commit('initialize', repository)
      context.commit('load')
      await context.dispatch('remotes/load')
      await context.dispatch('credentials/load')

      await context.dispatch('committer/inspect')

      await context.dispatch('committer/signature/name')
      await context.dispatch('committer/signature/email')
      await context.dispatch('committer/signature/message')

      const remote = await context.dispatch('configuration/read', 'default_remote', { root: true })
      await context.dispatch('remote', remote)

      await context.dispatch('log', { level: 'info', message: `Repository ${repository.name} ready` }, { root: true })
    },
    loaded: async function (context) {
      return context.state.loaded
    },
    remote: async function (context, name) {
      await api.repository.remote_clear()
      context.commit('remote', { remote: { name: '', url: '' }, branch: { name: '', short: '' } })

      if (!name) {
        return
      }

      await context.dispatch('credentials/load')

      const remote = context.state.remotes.list.find((remote) => remote.name === name)

      if (!remote) {
        throw new RepositoryRemoteNotFoundError()
      }

      await api.repository.remote_load(remote.name)

      const result = await api.repository.remote_status()

      if (result.remote) {
        context.commit('remote', { remote: result.remote, branch: result.branch })
      }

      if (result.pending) {
        context.commit('pending', result.pending)
      }
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
  },
  modules: {
    branches,
    committer,
    comparator,
    credentials,
    history,
    remotes,
  },
}
