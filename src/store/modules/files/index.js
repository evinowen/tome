import FileTree from './FileTree'
import File from './File'
import chokidar from 'chokidar'

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
    initialize: function (state, data) {
      const { path } = data

      state.tree = new FileTree(path)

      if (state.watcher) {
        state.watcher.close()
      }

      state.tree.crawl()

      state.watcher = chokidar.watch(path).on('change', (event, path) => state.tree.crawl())
    },
    load: function (state, data) {
      const { path } = data

      state.tree.load(path)
    },
    populate: function (state, data) {
      const { path } = data

      state.tree.populate(path)
    },
    toggle: function (state, data) {
      const { path } = data

      const { item } = state.tree.identify(path)

      item.expanded = !item.expanded
    },
    select: function (state, data) {
      const { path } = data

      state.active = path

      const { item } = state.tree.identify(path)

      state.selected = item

      if (!item.directory) {
        if (!item.document) {
          item.read()
        }

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
      const { parent, target, directory } = data

      const { item } = state.tree.identify(parent)

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
      await context.commit('initialize', { path })
    },
    toggle: async function (context, { path }) {
      const { item } = context.state.tree.identify(path)

      if (!item.expanded) {
        await context.dispatch('load', { path })
      }

      await context.commit('toggle', { path })
    },
    load: async function (context, { path }) {
      await context.commit('load', { path })
    },
    populate: async function (context, { path }) {
      await context.commit('populate', { path })
    },
    ghost: async function (context, { path, directory }) {
      const _fs = window.api.fs
      const _path = window.api.path

      let parent = path
      let target

      const status = await new Promise((resolve, reject) => _fs.lstat(path, (err, status) => err ? reject(err) : resolve(status)))

      if (!status.isDirectory()) {
        target = _path.basename(path)
        parent = _path.dirname(path)
      }

      await context.commit('ghost', { parent, target, directory })
    },
    select: async function (context, { path }) {
      await context.dispatch('save')
      await context.commit('select', { path })
    },
    update: async function (context, { content }) {
      await context.commit('update', { content })
    },
    save: async function (context) {
      const item = context.state.selected

      const _fs = window.api.fs

      if (item && !item.readonly && !item.directory && !item.clean) {
        item.clean = true
        await new Promise((resolve, reject) => _fs.writeFile(context.state.active, context.state.content, err => err ? reject(err) : resolve(true)))
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
      context.commit('select', { path })
      context.commit('edit', { edit: true })
    },
    blur: async function (context) {
      context.commit('edit', { edit: false })
      context.commit('blur')
    },
    move: async function (context, { path, proposed }) {
      const _fs = window.api.fs
      const _path = window.api.path

      let directory = proposed

      const status = await new Promise((resolve, reject) => _fs.lstat(proposed, (err, status) => err ? reject(err) : resolve(status)))

      if (!status.isDirectory()) {
        directory = _path.dirname(proposed)
      }

      const basename = _path.basename(path)
      const proposed_full = _path.join(directory, basename)
      const directory_current = _path.dirname(path)

      if (directory === directory_current) {
        await context.commit('error', { error: 'Invalid move, same directory.' })
        return
      }

      await new Promise((resolve, reject) => _fs.rename(path, proposed_full, (err) => err ? reject(err) : resolve(true)))

      await context.dispatch('populate', { path: directory_current })
      await context.dispatch('populate', { path: directory })
    },
    rename: async function (context, { path, name }) {
      const _fs = window.api.fs
      const _path = window.api.path

      const directory = _path.dirname(path)
      const proposed = _path.join(directory, name)

      await new Promise((resolve, reject) => _fs.rename(path, proposed, (err) => err ? reject(err) : resolve(true)))

      await context.dispatch('load', { path: directory })
      await context.dispatch('load', { path: proposed })

      await context.dispatch('select', { path: proposed })
    },
    create: async function (context, { path, name, directory }) {
      const _fs = window.api.fs
      const _path = window.api.path

      const proposed = _path.join(path, name)

      await new Promise((resolve, reject) => _fs.access(proposed, (err) => err ? resolve(true) : reject(new Error('File already exists'))))

      if (directory) {
        await new Promise((resolve, reject) => _fs.mkdir(proposed, (err) => err ? reject(err) : resolve(true)))
      } else {
        await new Promise((resolve, reject) => _fs.writeFile(proposed, '', (err) => err ? reject(err) : resolve(true)))
      }

      await context.dispatch('load', { path })
      await context.dispatch('load', { path: proposed })

      await context.dispatch('select', { path: proposed })
    },
    delete: async function (context, { path }) {
      const _fs = window.api.fs
      const _path = window.api.path

      const parent = _path.dirname(path)

      const unlink = async (path) => {
        const status = await new Promise((resolve, reject) => _fs.lstat(path, (err, status) => err ? reject(err) : resolve(status)))
        if (status.isDirectory()) {
          const files = await new Promise((resolve, reject) => _fs.readdir(path, (err, status) => err ? reject(err) : resolve(status)))

          for (const file of files) {
            await unlink(_path.join(path, file))
          }
        }

        await new Promise((resolve, reject) => _fs.unlink(path, (err) => err ? reject(err) : resolve(true)))
      }

      await unlink(path)
      await context.dispatch('populate', { path: parent })
    }
  }
}
