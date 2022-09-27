import Commit from './Commit'
import QuickCommit from './QuickCommit'
import Push from './Push'
import QuickPush from './QuickPush'

export const SystemPerformances = {
  Commit: 'commit',
  QuickCommit: 'quick-commit',
  Push: 'push',
  QuickPush: 'quick-push'
}

export default {
  namespaced: true,
  state: {
    version: null,
    process: null,
    maximized: false,
    branch: false,
    commit: false,
    commit_confirm: false,
    commit_push: false,
    console: false,
    edit: false,
    patch: false,
    push: false,
    push_confirm: false,
    search: false,
    settings: false
  },
  mutations: {
    load: function (state, { version, process }) {
      state.version = version
      state.process = process
    },
    set: function (state, data) {
      for (const key in data) {
        if (data[key] !== null) {
          state[key] = data[key] === true
        }
      }
    }
  },
  actions: {
    load: async function (context) {
      const version = await window.api.app.getVersion()
      const process = await window.api.app.getProcess()
      context.commit('load', { version, process })

      const maximized = await window.api.window.is_maximized()
      context.commit('set', { maximized })
    },
    read: async function (context, key) {
      return context.state[key]
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
      const dispatch = (action, data) => context.dispatch(action, data, { root: true })

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
    branch: async function (context, value = null) {
      context.commit('set', { branch: value })
      return context.state.branch
    },
    commit: async function (context, value = null) {
      context.commit('set', { commit: value })
      return context.state.commit
    },
    commit_confirm: async function (context, value = null) {
      if (value) {
        const auto_push = await context.dispatch('configuration/read', 'auto_push', { root: true })
        await context.dispatch('commit_push', auto_push)
      }

      context.commit('set', { commit_confirm: value })
      return context.state.commit_confirm
    },
    commit_push: async function (context, value = null) {
      context.commit('set', { commit_push: value })
      return context.state.commit_push
    },
    console: async function (context, value = null) {
      context.commit('set', { console: value })
      return context.state.console
    },
    edit: async function (context, value = null) {
      context.commit('set', { edit: value })
      return context.state.edit
    },
    patch: async function (context, value = null) {
      context.commit('set', { patch: value })
      return context.state.patch
    },
    push: async function (context, value = null) {
      context.commit('set', { push: value })
      return context.state.push
    },
    push_confirm: async function (context, value = null) {
      context.commit('set', { push_confirm: value })
      return context.state.push_confirm
    },
    search: async function (context, value = null) {
      context.commit('set', { search: value })
      return context.state.search
    },
    settings: async function (context, value = null) {
      context.commit('set', { settings: value })
      return context.state.settings
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
          context.commit('set', { name: value })
        },
        email: async function (context, value) {
          context.commit('set', { email: value })
        },
        message: function (context, value) {
          context.commit('set', { message: value })
        }
      }
    }
  }
}
