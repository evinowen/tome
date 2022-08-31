export const TemplateBaseConfiguration = {
  directory: false,
  map: {
    'index.md': 'index.md'
  }
}

export const TemplateBaseIndex = '# New Template\n'

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

      const { success, result = null } = await window.api.template_invoke(source, target)

      if (success) {
        if (result) {
          await context.dispatch('files/load', { path: target }, { root: true })
          await context.dispatch('files/select', { path: result }, { root: true })
        }

        await context.dispatch('message', `Template ${name} complete`, { root: true })

        return result
      } else {
        await context.dispatch('error', `Template ${name} failed: ${result}`, { root: true })
      }
    },
    ghost: async function (context) {
      const path = context.state.base

      const post = async (path) => {
        const config_item = await context.dispatch('files/create', { path, name: 'config.json' }, { root: true })
        const config_content = String(JSON.stringify(TemplateBaseConfiguration, null, 2)).concat('\n')
        await context.dispatch('files/save', { item: config_item, content: config_content }, { root: true })
        await context.dispatch('files/select', { item: config_item }, { root: true })

        const index_item = await context.dispatch('files/create', { path, name: 'index.md' }, { root: true })
        await context.dispatch('files/save', { item: index_item, content: TemplateBaseIndex }, { root: true })
        await context.dispatch('files/select', { item: index_item }, { root: true })
      }

      await context.dispatch('files/ghost', { path, directory: true, post }, { root: true })
    }
  }
}
