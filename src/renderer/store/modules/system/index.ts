import { MutationTree, ActionTree } from 'vuex'
import Commit from './commit'
import QuickCommit from './quick_commit'
import Push from './push'
import QuickPush from './quick_push'

export const SystemPerformances = {
  Commit: 'commit',
  QuickCommit: 'quick-commit',
  Push: 'push',
  QuickPush: 'quick-push'
}

export class State {
  version?: string
  process?: string
  maximized = false
  branch = false
  commit = false
  commit_confirm = false
  commit_push = false
  console = false
  edit = false
  patch = false
  push = false
  push_confirm = false
  search = false
  settings = false
}

export default {
  namespaced: true,
  state: new State,
  mutations: <MutationTree<State>>{
    load: function (state, { version, process }) {
      state.version = version
      state.process = process
    },
    set: function (state, data) {
      Object.assign(state, data)
    }
  },
  actions: <ActionTree<State, any>>{
    load: async function (context) {
      const version = await window.api.app.getVersion()
      const process = await window.api.app.getProcess()
      context.commit('load', { version, process })

      const maximized = await window.api.window.is_maximized()
      context.commit('set', { maximized })
    },
    read: async function (context, key) {
      switch (key) {
        case 'version':
          return context.state.version
        case 'process':
          return context.state.process
        case 'maximized':
          return context.state.maximized
        case 'branch':
          return context.state.branch
        case 'commit':
          return context.state.commit
        case 'commit_confirm':
          return context.state.commit_confirm
        case 'commit_push':
          return context.state.commit_push
        case 'console':
          return context.state.console
        case 'edit':
          return context.state.edit
        case 'patch':
          return context.state.patch
        case 'push':
          return context.state.push
        case 'push_confirm':
          return context.state.push_confirm
        case 'search':
          return context.state.search
        case 'settings':
          return context.state.settings
      }

      return
    },
    minimize: async function (context) {
      await window.api.window.minimize()
      context.commit('set', { maximized: false })
    },
    restore: async function (context) {
      await window.api.window.restore()
      context.commit('set', { maximized: false })
    },
    maximize: async function (context) {
      await window.api.window.maximize()
      context.commit('set', { maximized: true })
    },
    exit: async function () {
      await window.api.window.close()
    },
    perform: async function (context, performance) {
      const dispatch: (action: string, data?: any) => Promise<boolean>
       = async (action: string, data?: any) => await context.dispatch(action, data, { root: true }) === true

      switch (performance) {
        case SystemPerformances.Commit:
          await Commit.perform(dispatch)
          break

        case SystemPerformances.QuickCommit:
          await QuickCommit.perform(dispatch)
          break

        case SystemPerformances.Push:
          await Push.perform(dispatch)
          break

        case SystemPerformances.QuickPush:
          await QuickPush.perform(dispatch)
          break
      }
    },
    branch: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { branch: value })
      return context.state.branch
    },
    commit: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { commit: value })
      return context.state.commit
    },
    commit_confirm: async function (context, value) {
      if (value) {
        const auto_push = await context.dispatch('configuration/read', 'auto_push', { root: true })
        await context.dispatch('commit_push', auto_push)
      }

      typeof value !== 'boolean' || context.commit('set', { commit_confirm: value })
      return context.state.commit_confirm
    },
    commit_push: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { commit_push: value })
      return context.state.commit_push
    },
    console: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { console: value })
      return context.state.console
    },
    edit: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { edit: value })
      return context.state.edit
    },
    patch: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { patch: value })
      return context.state.patch
    },
    push: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { push: value })
      return context.state.push
    },
    push_confirm: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { push_confirm: value })
      return context.state.push_confirm
    },
    search: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { search: value })
      return context.state.search
    },
    settings: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { settings: value })
      return context.state.settings
    }
  },
  modules: {
    credentials: {
      namespaced: true,
      state: {
        key: undefined,
        passphrase: undefined
      },
      mutations: <MutationTree<State>>{
        set: function (state, data) {
          Object.assign(state, data)
        }
      },
      actions: <ActionTree<State, any>>{
        key: async function (context, value) {
          typeof value === undefined || context.commit('set', { key: value })
        },
        passphrase: async function (context, value) {
          typeof value === undefined || context.commit('set', { passphrase: value })
        }
      }
    },
    signature: {
      namespaced: true,
      state: {
        name: undefined,
        email: undefined,
        message: undefined
      },
      mutations: <MutationTree<State>>{
        set: function (state, data) {
          Object.assign(state, data)
        }
      },
      actions: <ActionTree<State, any>>{
        name: async function (context, value) {
          typeof value === undefined || context.commit('set', { name: value })
        },
        email: async function (context, value) {
          typeof value === undefined || context.commit('set', { email: value })
        },
        message: function (context, value) {
          typeof value === undefined || context.commit('set', { message: value })
        }
      }
    }
  }
}
