import FileTree from './FileTree'
import File from './File'
// import chokidar from 'chokidar'

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
    watcher: null
  },
  mutations: {
    initialize: function (state, tree) {
      if (state.watcher) {
        state.watcher.close()
      }

      state.tree = tree

      // state.watcher = chokidar.watch(path).on('change', (event, path) => state.tree.crawl())
    },
    load: function (state, data) {
      const { path } = data

      state.tree.load(path)
    },
    populate: function (state, data) {
      const { path } = data

      state.tree.populate(path)
    },
    toggle: function (state, item) {
      item.expanded = !item.expanded
    },
    select: function (state, data) {
      const { path, item } = data

      state.active = path
      state.selected = item

      if (!item.directory && item.document) {
        state.content = item.document.content
      }
    },
    update: function (state, data) {
      const { content } = data

      state.selected.clean = false
      state.content = content
    },
    edit: function (state, data) {
      const { edit } = data
      state.editing = edit

      if (!state.editing && state.selected.ephemeral) {
        const { parent } = state.ghost
        const index = parent.children.findIndex(child => child.uuid === state.ghost.uuid)
        parent.children.splice(index, 1)
      }
    },
    ghost: function (state, data) {
      const { item, target, directory } = data

      let ancestor = item

      const legacy = []

      while (ancestor) {
        legacy.push(ancestor)
        ancestor = ancestor.parent
      }

      while (legacy.length) {
        ancestor = legacy.pop()
        ancestor.expanded = true
      }

      let index = item.children.length
      if (target) {
        index = item.children.findIndex(child => child.name === target)
      }

      if (state.ghost) {
        const { parent } = state.ghost
        const index = parent.children.findIndex(child => child.uuid === state.ghost.uuid)

        if (index > -1) {
          parent.children.splice(index, 1)
        }

        state.ghost = null
      }

      state.ghost = new File({ parent: item, ephemeral: true, directory })

      item.children.splice(index, 0, state.ghost)

      state.selected = state.ghost
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

      await context.commit('initialize', tree)

      await context.state.tree.crawl()
    },
    toggle: async function (context, { path }) {
      const { item } = await context.state.tree.identify(path)

      if (!item.expanded) {
        await context.dispatch('load', { path })
      }

      await context.commit('toggle', item)
    },
    load: async function (context, { path }) {
      await context.commit('load', { path })
    },
    populate: async function (context, { path }) {
      await context.commit('populate', { path })
    },
    ghost: async function (context, { path, directory }) {
      let parent = path
      let target

      if (!await window.api.file_is_directory(path)) {
        target = await window.api.path_basename(path)
        parent = await window.api.path_dirname(path)
      }

      const { item } = await context.state.tree.identify(parent)

      await context.commit('ghost', { item, target, directory })
    },
    select: async function (context, { path }) {
      await context.dispatch('save')

      const { item } = await context.state.tree.identify(path)
      if (!item.directory && !item.document) {
        await item.read()
      }

      await context.commit('select', { path, item })
    },
    update: async function (context, { content }) {
      await context.commit('update', { content })
    },
    save: async function (context) {
      const item = context.state.selected

      if (item && !item.readonly && !item.directory && !item.clean) {
        item.clean = true
        await window.api.file_write(context.state.active, context.state.content)
      }
    },
    submit: async function (context, { input, title }) {
      const item = context.state.selected

      context.commit('edit', { edit: false })

      let name = input.toLowerCase().replace(/ +/g, '.').replace(/[^a-z0-9.-]/g, '')

      if (title && !item.directory) {
        name = name.concat('.md')
      }

      const words = String(name).split('.')

      if (words.length && !item.directory) {
        const ext = words.pop()

        if (ext !== 'md') {
          name = name.concat('.md')
        }
      }

      if (item.ephemeral) {
        await context.dispatch('create', { path: item.parent.path, name, directory: item.directory })
      } else {
        await context.dispatch('rename', { path: item.path, name })
      }
    },
    edit: async function (context, { path }) {
      const { item } = await context.state.tree.identify(path)
      if (!item.directory && !item.document) {
        await item.read()
      }

      context.commit('select', { path, item })
      context.commit('edit', { edit: true })
    },
    blur: async function (context) {
      context.commit('edit', { edit: false })
      context.commit('blur')
    },
    move: async function (context, { path, proposed }) {
      let directory = proposed

      if (!await window.api.file_is_directory(proposed)) {
        directory = await window.api.path_dirname(proposed)
      }

      const basename = await window.api.path_basename(path)
      const proposed_full = await window.api.path_join(directory, basename)
      const directory_current = await window.api.path_dirname(path)

      if (directory === directory_current) {
        await context.commit('error', { error: 'Invalid move, same directory.' })
        return
      }

      await window.api.file_rename(path, proposed_full)

      await context.dispatch('populate', { path: directory_current })
      await context.dispatch('populate', { path: directory })
    },
    rename: async function (context, { path, name }) {
      const directory = await window.api.path_dirname(path)
      const proposed = await window.api.path_join(directory, name)

      await window.api.file_rename(path, proposed)

      await context.dispatch('load', { path: directory })
      await context.dispatch('load', { path: proposed })

      const { item } = await context.state.tree.identify(proposed)
      if (!item.directory && !item.document) {
        await item.read()
      }

      await context.dispatch('select', { path: proposed, item })
    },
    create: async function (context, { path, name, directory }) {
      const proposed = await window.api.path_join(path, name)

      let result = false

      if (directory) {
        result = await window.api.file_create_directory(proposed)
      } else {
        result = await window.api.file_create(proposed)
      }

      if (!result) {
        throw new Error(`Failed to create path ${path}`)
      }

      await context.dispatch('load', { path })
      await context.dispatch('load', { path: proposed })

      const { item } = await context.state.tree.identify(proposed)
      if (!item.directory && !item.document) {
        await item.read()
      }

      await context.dispatch('select', { path: proposed, item })
    },
    delete: async function (context, { path }) {
      const parent = await window.api.path_dirname(path)

      await window.api.file_delete(path)
      await context.dispatch('populate', { path: parent })
    }
  }
}
