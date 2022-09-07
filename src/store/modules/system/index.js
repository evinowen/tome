export default {
  namespaced: true,
  state: {
    maximized: false,
    branch: false,
    commit: false,
    console: false,
    edit: false,
    patch: false,
    push: false,
    search: false,
    settings: false
  },
  mutations: {
    set: function (state, data) {
      for (const key in data) {
        state[key] = data[key] === true
      }
    },
    search: function (state, value) {
      state.search = value
    }
  },
  actions: {
    hydrate: async function (context) {
      const maximized = await window.api.is_window_maximized()
      context.commit('set', { maximized })
    },
    minimize: async function (context) {
      await window.api.minimize_window()
      context.commit('set', { maximized: false })
    },
    restore: async function (context) {
      await window.api.restore_window()
      context.commit('set', { maximized: false })
    },
    maximize: async function (context) {
      await window.api.maximize_window()
      context.commit('set', { maximized: true })
    },
    exit: async function () {
      await window.api.close_window()
    },
    open: async function (context, path) {
      await context.dispatch('library/add', path, { root: true })
      await context.dispatch('tome/load', path, { root: true })
      await context.dispatch('files/initialize', { path: path }, { root: true })
      await context.dispatch('tome/inspect', null, { root: true })
    },
    close: async function (context, path) {
      await context.dispatch('tome/clear', null, { root: true })
      await context.dispatch('files/clear', null, { root: true })
    },
    perform: async function (context, performance) {
    },
    branch: async function (context, value) {
      context.commit('set', { branch: value })
    },
    commit: async function (context, value) {
      context.commit('set', { commit: value })
    },
    console: async function (context, value) {
      context.commit('set', { console: value })
    },
    edit: async function (context, value) {
      context.commit('set', { edit: value })
    },
    patch: async function (context, value) {
      context.commit('set', { patch: value })
    },
    push: async function (context, value) {
      context.commit('set', { push: value })
    },
    search: async function (context, value) {
      context.commit('set', { search: value })
    },
    settings: async function (context, value) {
      context.commit('set', { settings: value })
    }
  }
}
