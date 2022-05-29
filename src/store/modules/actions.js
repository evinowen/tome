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
      const _fs = window.api.fs
      const _path = window.api.path

      const base = _path.join(path, '.tome', 'actions')

      try {
        const stats = await new Promise((resolve, reject) => _fs.lstat(base, (err, stats) => err ? reject(err) : resolve(stats)))

        if (!stats.isDirectory()) {
          return
        }
      } catch (error) {
        return
      }

      const files = await new Promise((resolve, reject) => _fs.readdir(base, (err, files) => err ? reject(err) : resolve(files)))

      context.commit('load', { path, base, options: files })
    },
    execute: async function (context, { name, target }) {
      const _fs = window.api.fs
      const _path = window.api.path

      if (context.state.options.indexOf(name) < 0) {
        return
      }

      const base = _path.join(context.state.base, name)

      const path = _path.join(base, 'index.js')

      const raw = await new Promise((resolve, reject) => _fs.readFile(path, 'utf8', (err, data) => err ? reject(err) : resolve(data)))

      const _vm = require('vm')
      const script = _vm.createScript(raw)

      script.runInThisContext()
    }
  }
}
