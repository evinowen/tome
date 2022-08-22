export const ActionBaseIndex = 'resolve(true)\n'

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

      const result = await window.api.action_invoke(source, target)

      if (result.success) {
        const message = `Action ${name} successful${result.message ? `: ${result.message}` : ''}`
        await context.dispatch('message', message, { root: true })
      } else {
        const error = `Action ${name} failed: ${result.error}`
        await context.dispatch('error', error, { root: true })
      }
    },
    ghost: async function (context) {
      const path = context.state.base

      const post = async (path) => {
        const index_item = await context.dispatch('files/create', { path, name: 'index.js' }, { root: true })

        await context.dispatch('files/save', { item: index_item, content: ActionBaseIndex }, { root: true })

        await context.dispatch('files/select', { item: index_item }, { root: true })
      }

      await context.dispatch('files/ghost', { path, directory: true, post }, { root: true })
    }
  }
}
