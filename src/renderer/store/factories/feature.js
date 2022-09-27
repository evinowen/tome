export default (feature, create, execute) => ({
  namespaced: true,
  state: {
    target: null,
    options: []
  },
  mutations: {
    target: function (state, target) {
      state.target = target
    },
    options: function (state, options) {
      state.options.length = 0
      state.options.push(...options)
    }
  },
  actions: {
    load: async function (context, { path }) {
      const target = {
        base: path,
        absolute: await window.api.path_join(path, '.tome', feature)
      }

      target.relative = await window.api.path_relative(path, target.absolute)

      context.commit('target', target)

      const options = await window.api.directory_list(context.state.target.absolute)

      if (!options || options.length < 1) {
        return
      }

      context.commit('options', options)
    },
    execute: async function (context, data) {
      const { name } = data

      if (context.state.options.indexOf(name) < 0) {
        return
      }

      const source = await window.api.path_join(context.state.target.absolute, name)

      return await (execute(context))({ source, ...data })
    },
    ghost: async function (context) {
      await context.dispatch('prepare')

      const path = context.state.target.absolute

      await context.dispatch('files/ghost', { path, directory: true, post: create(context) }, { root: true })
    },
    prepare: async function (context) {
      const targets = context.state.target.relative.split(await window.api.path_sep())

      let path = context.state.target.base
      let parent = await context.dispatch('files/identify', { path }, { root: true })

      for (const target of targets) {
        if (!parent) {
          throw new Error(`Cannot ensure ${feature} feature file structure.`)
        }

        path = await window.api.path_join(path, target)

        const item = await context.dispatch('files/identify', { path }, { root: true })

        if (!item) {
          parent = await context.dispatch('files/create', { item: parent, name: target, directory: true }, { root: true })
        } else {
          parent = item
        }
      }
    }
  }
})
