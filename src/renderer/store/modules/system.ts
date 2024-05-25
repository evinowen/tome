import { MutationTree, ActionTree } from 'vuex'
import api from '@/api'
import Commit from '@/objects/performances/Commit'
import QuickCommit from '@/objects/performances/QuickCommit'
import AutoCommit from '@/objects/performances/AutoCommit'
import Push from '@/objects/performances/Push'
import QuickPush from '@/objects/performances/QuickPush'

export enum SystemPerformance {
  Commit = 'commit',
  QuickCommit = 'quick-commit',
  AutoCommit = 'auto-commit',
  Push = 'push',
  QuickPush = 'quick-push',
}

export enum SystemTimeout {
  Minute = 'minute',
  QuarterHour = 'quarter-hour',
  HalfHour = 'half-hour',
  Hour = 'hour',
  QuarterDay = 'quarter-day',
  HalfDay = 'half-day',
  Day = 'day',
}

export interface State {
  version?: string
  process?: {
    versions?: Record<string, string>
    sandboxed: boolean
  }
  maximized: boolean
  commit: boolean
  commit_confirm: boolean
  commit_push: boolean
  console: boolean
  edit: boolean
  history: boolean
  patch: boolean
  push: boolean
  push_confirm: boolean
  remotes: boolean
  search: boolean
  settings: boolean
  theme_editor: boolean
}

export const StateDefaults = (): State => ({
  maximized: false,
  commit: false,
  commit_confirm: false,
  commit_push: false,
  console: false,
  edit: false,
  history: false,
  patch: false,
  push: false,
  push_confirm: false,
  remotes: false,
  search: false,
  settings: false,
  theme_editor: false,
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    load: function (state, { version, process }) {
      state.version = version
      state.process = process
    },
    set: function (state, data) {
      Object.assign(state, data)
    },
  },
  actions: <ActionTree<State, unknown>>{
    load: async function (context) {
      const version = await api.app.getVersion()
      const process = await api.app.getProcess()
      context.commit('load', { version, process })

      const maximized = await api.window.is_maximized()
      context.commit('set', { maximized })
    },
    read: async function (context, key) {
      return context.state[key] ?? undefined
    },
    minimize: async function (context) {
      await api.window.minimize()
      context.commit('set', { maximized: false })
    },
    restore: async function (context) {
      await api.window.restore()
      context.commit('set', { maximized: false })
    },
    maximize: async function (context) {
      await api.window.maximize()
      context.commit('set', { maximized: true })
    },
    exit: async function () {
      await api.window.close()
    },
    perform: async function (context, performance: SystemPerformance) {
      const ready = await context.dispatch('repository/loaded', undefined, { root: true })
      if (!ready) {
        return
      }

      const dispatch: (action: string, data?: unknown) => Promise<boolean>
       = async (action: string, data?: unknown) => await context.dispatch(action, data, { root: true }) === true

      switch (performance) {
        case SystemPerformance.Commit:
          await Commit.perform(dispatch)
          break

        case SystemPerformance.QuickCommit:
          await QuickCommit.perform(dispatch)
          break

        case SystemPerformance.AutoCommit:
          await AutoCommit.perform(dispatch)
          break

        case SystemPerformance.Push:
          await Push.perform(dispatch)
          break

        case SystemPerformance.QuickPush:
          await QuickPush.perform(dispatch)
          break
      }
    },
    history: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { history: value })
      return context.state.history
    },
    commit: async function (context, value: boolean) {
      if (value) {
        await context.dispatch('repository/committer/inspect', undefined, { root: true })
        await context.dispatch('repository/committer/signature/uncheck', undefined, { root: true })
      }

      typeof value !== 'boolean' || context.commit('set', { commit: value })
      return context.state.commit
    },
    commit_confirm: async function (context, value) {
      if (value) {
        if (!await context.dispatch('repository/committer/signature/check', undefined, { root: true })) {
          return false
        }

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
      if (!value) {
        await context.dispatch('files/debounce_flush', undefined, { root: true })
        await context.dispatch('files/reselect', undefined, { root: true })
      }

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
    remotes: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { remotes: value })
      return context.state.remotes
    },
    search: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { search: value })
      return context.state.search
    },
    settings: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { settings: value })
      return context.state.settings
    },
    theme_editor: async function (context, value) {
      typeof value !== 'boolean' || context.commit('set', { theme_editor: value })
      return context.state.theme_editor
    },
    timer: async function (context, timeout: SystemTimeout) {
      context.dispatch('log', { level: 'trace', message: `System Timer [${timeout}] Triggered` }, { root: true })
      const auto_commit = await context.dispatch('configuration/read', 'auto_commit', { root: true })

      if (auto_commit) {
        const auto_commit_interval = await context.dispatch('configuration/read', 'auto_commit_interval', { root: true })
        if (auto_commit_interval === timeout) {
          context.dispatch('log', { level: 'debug', message: `Auto-Commit Triggered for timer [${timeout}]` }, { root: true })
          context.dispatch('perform', SystemPerformance.AutoCommit)
        }
      }
    },
  },
}
