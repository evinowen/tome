export default {
  namespaced: true,
  state: {
    path: null,
    base: null,
    last: null,
    options: []
  },
  mutations: {
    load: function (state, { path, base, options }) {
      state.path = path
      state.base = base
      state.options.length = 0
      state.options.push(...options)
    },
    complete: function (state, { path }) {
      state.last = { path, timestamp: Date.now() }
    }
  },
  actions: {
    load: async function (context, { path }) {
      const base = await window.api.path_join(path, '.tome', 'templates')

      const files = await window.api.directory_list(base)

      if (!files || files.length < 1) {
        return
      }

      context.commit('load', { path, base, options: files })
    },
    execute: async function (context, { name, target }) {
      if (context.state.options.indexOf(name) < 0) {
        return
      }

      const source = await window.api.path_join(context.state.base, name)

      const result = await window.api.template_invoke(source, target)

      if (result.success) {
        const message = `Template ${name} successful${result.message ? `: ${result.message}` : ''}`
        await context.dispatch('message', message, { root: true })
      } else {
        const error = `Template ${name} failed: ${result.error}`
        await context.dispatch('error', error, { root: true })
      }

      context.commit('complete', { path: target })
    },
    ghost: async function (context) {
      const path = context.state.base

      const post = async (path) => {
        for (const name of ['.config.json', 'index.md']) {
          await context.dispatch('files/create', { path, name }, { root: true })
        }
      }

      await context.dispatch('files/ghost', { path, directory: true, post }, { root: true })
    }
  }
}
