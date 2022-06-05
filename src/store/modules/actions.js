export default {
  namespaced: true,
  state: {
    path: null,
    base: null,
    options: []
  },
  mutations: {
    load: function (state, { path, base, options }) {
      state.path = path
      state.base = base
      state.options.length = 0
      state.options.push(...options)
    }
  },
  actions: {
    load: async function (context, { path }) {
      const base = await window.api.path_join(path, '.tome', 'actions')

      const files = await window.api.directory_list(base)

      context.commit('load', { path, base, options: files })
    },
    execute: async function (context, { name, target }) {
      if (context.state.options.indexOf(name) < 0) {
        return
      }

      const base = await window.api.path_join(context.state.base, name)

      const path = await window.api.path_join(base, 'index.js')

      const raw = await window.api.file_contents(path)

      const _vm = require('vm')
      const script = _vm.createScript(raw)

      script.runInThisContext()
    }
  }
}
