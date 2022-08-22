import FileTree, { FileIdentity, FileIdentityContract } from './FileTree'

export default {
  namespaced: true,
  state: {
    active: null,
    content: null,
    error: null,
    tree: null,
    ghost: null,
    selected: null,
    editing: false,
    post: null,
    watcher: null
  },
  mutations: {
    initialize: function (state, tree) {
      state.tree = tree
    },
    load: function (state, contract) {
      const { item, payload } = contract

      if (item.directory) {
        item.fill(payload)
      } else {
        item.render(payload)
      }
    },
    toggle: function (state, item) {
      item.expanded = !item.expanded
    },
    unload: function (state, item) {
      item.loaded = false
    },
    select: function (state, data) {
      const { item } = data

      state.active = item.path
      state.selected = item

      if (!item.directory && item.document) {
        state.content = item.document.content
      }
    },
    edit: function (state, data) {
      const { edit } = data
      state.editing = edit

      if (!state.editing && state.selected.ephemeral) {
        const { parent } = state.ghost
        parent.exercise()
        state.ghost = null
      }
    },
    haunt: function (state, data) {
      const { item, directory, post } = data

      if (!item.directory) {
        state.ghost = item.parent.haunt(directory, item)
      } else {
        state.ghost = item.haunt(directory)
      }

      state.post = post
      state.editing = true
    },
    blur: function (state) {
      state.selected = null
    },
    error: function (state, data) {
      const { error } = data

      state.error = error
    }
  },
  actions: {
    initialize: async function (context, { path }) {
      const tree = await FileTree.make(path)

      context.commit('initialize', tree)

      await context.dispatch('toggle', tree.base)
    },
    identify: async function (context, criteria) {
      const { item = null, path = null } = criteria

      if (item) {
        return item
      }

      let identity = await context.state.tree.identify(path)

      while (true) {
        if (!identity) {
          throw new Error(`File path ${path} does not exist`)
        }

        if (identity instanceof FileIdentity) {
          break
        }

        if (identity instanceof FileIdentityContract) {
          const contract = await identity.item.load()
          context.commit('load', contract)

          identity = await FileTree.search(identity.item, identity.queue)
        } else {
          throw new Error(`File path ${path} failed to identify`)
        }
      }

      return identity.item
    },
    toggle: async function (context, criteria) {
      const item = await context.dispatch('identify', criteria)

      if (!item.expanded) {
        await context.dispatch('load', { item })
      }

      context.commit('toggle', item)

      return item
    },
    container: async function (context, criteria) {
      const item = await context.dispatch('identify', criteria)

      if (item.directory) {
        return item
      }

      return parent
    },
    load: async function (context, criteria) {
      const item = await context.dispatch('identify', criteria)

      if (!item.ephemeral) {
        const contract = await item.load()
        context.commit('load', contract)
      }

      return item
    },
    ghost: async function (context, criteria) {
      const { directory = false, post = null } = criteria
      const item = await context.dispatch('load', criteria)

      await context.dispatch('select', { item })

      if (!item.expanded) {
        await context.dispatch('toggle', { item })
      }

      context.commit('haunt', { item, directory, post })

      await context.dispatch('select', { item: context.state.ghost })

      return context.state.ghost
    },
    select: async function (context, criteria) {
      const item = await context.dispatch('load', criteria)

      let parent = item
      while (parent.parent) {
        parent = parent.parent

        if (!parent.expanded) {
          await context.dispatch('toggle', { item: parent })
        }
      }

      context.commit('select', { item })

      return item
    },
    save: async function (context, criteria) {
      const { content } = criteria
      const item = await context.dispatch('load', criteria)

      await item.write(content)
      context.commit('unload', item)

      return item
    },
    submit: async function (context, { input, title }) {
      context.commit('edit', { edit: false })

      let name = input.toLowerCase().replace(/ +/g, '.').replace(/[^a-z0-9.-]/g, '')

      if (title && !context.state.selected.directory) {
        name = name.concat('.md')
      }

      const words = String(name).split('.')

      if (words.length && !context.state.selected.directory) {
        const ext = words.pop()

        if (ext !== 'md') {
          name = name.concat('.md')
        }
      }

      let item

      if (context.state.selected.ephemeral) {
        const { parent, directory } = context.state.selected
        item = await context.dispatch('create', { item: parent, name, directory })
      } else {
        item = await context.dispatch('rename', { item: context.state.selected, name })
      }

      await context.dispatch('select', { item })

      if (context.state.post) {
        await context.state.post(item.path)
      }

      return item
    },
    edit: async function (context, criteria) {
      const item = await context.dispatch('select', criteria)
      context.commit('edit', { edit: true })

      return item
    },
    blur: async function (context) {
      context.commit('edit', { edit: false })
      context.commit('blur')

      return context.state.selected
    },
    move: async function (context, criteria) {
      const { proposed } = criteria
      const item = await context.dispatch('identify', criteria)

      const parents = {
        original: item.parent,
        replacement: await context.dispatch('container', { path: proposed })
      }

      const path = await item.move(parents.replacement.path)

      context.commit('unload', item)

      if (parents.original) {
        context.commit('unload', parents.original)
        await context.dispatch('load', { item: parents.original })
      }

      if (parents.replacement) {
        context.commit('unload', parents.replacement)
      }

      return await context.dispatch('select', { path })
    },
    rename: async function (context, criteria) {
      const { name } = criteria
      const item = await context.dispatch('identify', criteria)

      if (item.parent) {
        context.commit('unload', item.parent)
      }

      const path = await item.rename(name)

      return await context.dispatch('identify', { path })
    },
    create: async function (context, criteria) {
      const { name, directory = false } = criteria
      const item = await context.dispatch('identify', criteria)

      const path = await item.create(name, directory)

      context.commit('unload', item)

      return await context.dispatch('identify', { path })
    },
    delete: async function (context, criteria) {
      const item = await context.dispatch('identify', criteria)

      await item.delete()

      context.commit('unload', item.parent)
      await context.dispatch('load', { item: item.parent })
    }
  }
}
