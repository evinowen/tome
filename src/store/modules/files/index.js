import { remote } from 'electron'
import FileTree from './FileTree'

export default {
  namespaced: true,
  state: {
    active: null,
    content: null,
    error: null,
    tree: null
  },
  mutations: {
    initialize: function (state, data) {
      const { path } = data

      state.tree = new FileTree(path)
    },
    toggle: function (state, data) {
      const { path } = data

      const { item } = state.tree.identify(path)

      item.expanded = !item.expanded
    },
    select: function (state, data) {
      const { path } = data

      state.active = path
    },
    content: function (state, data) {
      const { content } = data

      state.content = content
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
      await context.commit('toggle', { path })
    },
    populate: async function (context, { path }) {
      const _fs = remote.require('fs')
      const { item } = context.state.tree.identify(path)

      const files = await new Promise((resolve, reject) => _fs.readdir(
        item.path,
        { withFileTypes: true },
        (err, files) => err ? reject(err) : resolve(files)
      ))

      item.children.length = 0
      item.children.push(...files.map(context.state.tree.mapper(item.path)))
    },
    ghost: async function (context, { path, directory }) {
      const _fs = remote.require('fs')
      const _path = remote.require('path')

      let parent = path
      let target

      const status = await new Promise((resolve, reject) => _fs.lstat(path, (err, status) => err ? reject(err) : resolve(status)))

      if (!status.isDirectory()) {
        target = _path.basename(path)
        parent = _path.dirname(path)
      }

      const { item } = context.state.tree.identify(parent)

      let index = item.children.length
      if (target) {
        index = item.children.findIndex(child => child.name === target)
      }

      item.children.splice(index, 0, context.state.tree.make({ ephemeral: true, directory }))
    },
    select: async function (context, { path }) {
      await context.commit('error', { error: null })

      const { item } = context.state.tree.identify(path)

      if (!item || !item.path) {
        return
      }

      await context.commit('select', { path })

      const _fs = remote.require('fs')

      const status = await new Promise((resolve, reject) => _fs.lstat(path, (err, status) => err ? reject(err) : resolve(status)))

      if (status.isDirectory()) {
        await context.commit('error', { error: 'Cannot load contents of directory' })
        return
      }

      const _path = remote.require('path')

      const ext = _path.extname(path).toLowerCase()

      if (ext !== '.md') {
        this.error = `File has invalid ${ext} extension.`
        return
      }

      await context.commit('content', { content: _fs.readFileSync(path, 'utf8') })
    },
    save: async function (context, { content }) {
      const _fs = remote.require('fs')

      console.log('content', content)
      await new Promise((resolve, reject) => _fs.writeFile(context.state.active, content, err => err ? reject(err) : resolve(true)))
      await context.commit('content', { content })
    },
    submit: async function (context, { path, input, title }) {
      const { item } = context.state.tree.identify(path)
      let name = input

      if (title) {
        name = name.toLowerCase().replace(/ +/g, '.')

        if (!item.directory) {
          name = name.concat('.md')
        }
      }

      if (item.ephemeral) {
        context.dispatch('create', { path, name, directory: item.directory })
      } else {
        context.dispatch('rename', { path, name })
      }
    },
    move: async function (context, { path, proposed }) {
      const _fs = remote.require('fs')
      const _path = remote.require('path')

      let directory = proposed

      const status = await new Promise((resolve, reject) => _fs.lstat(proposed, (err, status) => err ? reject(err) : resolve(status)))

      if (!status.isDirectory()) {
        directory = _path.dirname(proposed)
      }

      const basename = _path.basename(path)
      const proposed_full = _path.join(directory, basename)
      const directory_current = _path.dirname(path)

      if (directory === directory_current) {
        this.error = 'Invalid move, same directory.'
        return
      }

      await new Promise((resolve, reject) => _fs.rename(path, proposed_full, (err) => err ? reject(err) : resolve(true)))

      context.dispatch('populate', { path: directory_current })
      context.dispatch('populate', { path: directory })
    },
    rename: async function (context, { path, name }) {
      const _fs = remote.require('fs')
      const _path = remote.require('path')

      const directory = _path.dirname(path)
      const proposed = _path.join(directory, name)

      const parent = _path.dirname(path)

      await new Promise((resolve, reject) => _fs.rename(path, proposed, (err) => err ? reject(err) : resolve(true)))

      context.dispatch('populate', { path: parent })
    },
    create: async function (context, { path, name, directory }) {
      const _fs = remote.require('fs')
      const _path = remote.require('path')

      const proposed = _path.join(path, name)

      await new Promise((resolve, reject) => _fs.access(proposed, (err) => err ? resolve(true) : reject(new Error('File already exists'))))

      if (directory) {
        await new Promise((resolve, reject) => _fs.mkdir(path, (err) => err ? reject(err) : resolve(true)))
      } else {
        await new Promise((resolve, reject) => _fs.writeFile(path, '', (err) => err ? reject(err) : resolve(true)))
      }

      context.dispatch('populate', { path })
    },
    delete: async function (context, { path }) {
      const _fs = remote.require('fs')
      const _path = remote.require('path')

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

      unlink(path)

      context.dispatch('populate', { path: parent })
    }
  }
}
