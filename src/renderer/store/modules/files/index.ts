import Vue from 'vue'
import { MutationTree, ActionTree } from 'vuex'
import File, { FileLoadContract } from './file'
import FileTree, { FileIdentity, FileIdentityContract } from './file_tree'
import { debounce } from 'lodash'

class FileTreeNotEstablishedError extends Error {}
class FileNotSelectedError extends Error {}
class FileSubmitFailureError extends Error {}

export const ChokidarEvent = {
  ADD: 'add',
  ADD_DIR: 'addDir',
  DELETE: 'unlink',
  DELETE_DIR: 'unlinkDir'
}

export class State {
  path = ''
  directory: { [key: string]: File } = {}
  active = ''
  content = ''
  ghost = ''
  base = ''
  selected = ''
  editing = false
  tree?: FileTree
  post?: (path: string) => void
}

export const debounce_save = debounce((context, criteria) => {
  return context.dispatch('save', criteria)
}, 500)

export default {
  namespaced: true,
  state: new State,
  mutations: <MutationTree<State>>{
    initialize: function (state, tree) {
      state.tree = tree
      state.base = tree.base.uuid
      state.path = tree.base.path
      Vue.set(state.directory, tree.base.uuid, tree.base)
    },
    clear: function (state) {
      state.tree = undefined
      state.directory = {}
    },
    load: function (state, contract: FileLoadContract) {
      const { item, payload } = contract

      if (item.directory) {
        item.fill(payload)

        for (const file of payload.children) {
          Vue.set(state.directory, file.uuid, file)
        }
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

      state.active = item.uuid
      state.selected = item.uuid
      state.content = ''

      if (!(item.ephemeral || item.directory) && item.document) {
        state.content = item.document.content
      }
    },
    edit: function (state, data) {
      const { edit } = data
      state.editing = edit

      if (state.editing) {
        return
      }

      if (state.selected != '' && state.ghost !== '') {
        const selected = state.directory[state.selected]
        if (selected.ephemeral) {
          state.directory[state.ghost].exercise()

          Vue.delete(state.directory, state.ghost)

          state.ghost = ''
          state.selected = ''
        }
      }
    },
    haunt: function (state, data) {
      const { item, directory, post } = data
      const ghost = item.directory
        ? item.haunt(directory)
        : item.parent.haunt(directory, item)

      state.ghost = ghost.uuid
      state.selected = ghost.uuid
      state.post = post
      state.editing = true

      Vue.set(state.directory, ghost.uuid, ghost)
    },
    blur: function (state) {
      state.active = ''
      state.selected = ''
    }
  },
  actions: <ActionTree<State, unknown>>{
    initialize: async function (context, { path }) {
      await context.dispatch('message', `Initialize file tree at ${path} ... `, { root: true })
      const tree = await FileTree.make(path)

      context.commit('initialize', tree)

      await tree.listen(async (data) => {
        if (context.state.tree === undefined) {
          throw new FileTreeNotEstablishedError()
        }

        const { event, path: relative } = data
        const identity = context.state.tree.identify(relative)

        if (!identity || identity instanceof FileIdentityContract) {
          return
        }

        const { item, parent } = identity
        const target = parent || item

        switch (event) {
          case ChokidarEvent.ADD:
          case ChokidarEvent.ADD_DIR:
          case ChokidarEvent.DELETE:
          case ChokidarEvent.DELETE_DIR:
            await context.dispatch('message', `Refresh ${target.path}`, { root: true })
            context.commit('unload', target)
            await context.dispatch('load', { item: target })
            break
        }
      })

      await context.dispatch('toggle', { item: context.state.tree.base } )
    },
    clear: async function (context) {
      context.commit('clear')
    },
    identify: async function (context, criteria) {
      const { item, path } = criteria

      if (context.state.tree === undefined) {
        throw new FileTreeNotEstablishedError()
      }

      if (item) {
        return item
      }

      if (path === context.state.tree.base.path) {
        return context.state.tree.base
      }

      const relative = await context.state.tree.relative(path)
      let identity = context.state.tree.identify(relative || '')

      for (;;) {
        if (!identity) {
          throw new Error(`File path ${path} does not exist`)
        }

        if (identity instanceof FileIdentity) {
          break
        }

        if (identity instanceof FileIdentityContract) {
          const contract = await identity.item.load(
            context.state.tree.base,
            async (object) => {
              switch (object.type) {
              case 'read':
                await context.dispatch('message', `Read (identity) ${object.bytes} bytes @ ${object.path}`, { root: true })
                break

              case 'populated':
                await context.dispatch('message', `Populate (identity) ${object.path}`, { root: true })
                break
              }
            }
          )

          context.commit('load', contract)
          await context.dispatch('message', `Item directory @ ${Object.keys(context.state.directory).length})`, { root: true })

          identity = await FileTree.search(identity.item, identity.queue)
        } else {
          throw new TypeError(`File path ${path} failed to identify`)
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

      return item.parent
    },
    load: async function (context, criteria) {
      const item: File = await context.dispatch('identify', criteria)
      await context.dispatch('message', `Load ${item.path}`, { root: true })

      if (!item.ephemeral) {
        const contract = await item.load(
          context.state.tree.base,
          async (object) => {
            switch (object.type) {
            case 'read':
              await context.dispatch('message', `Read (load) ${object.bytes} bytes @ ${object.path}`, { root: true })
              break

            case 'populated':
              await context.dispatch('message', `Populate (load) ${object.path}`, { root: true })
              break
            }
          }
        )

        context.commit('load', contract)
        await context.dispatch('message', `Item directory @ ${Object.keys(context.state.directory).length})`, { root: true })

        await context.dispatch('message', `Load ${item.path} complete`, { root: true })
      }

      return item
    },
    open: async function (context, criteria) {
      const { container = false } = criteria
      const item = await context.dispatch('identify', criteria)

      await item.open(container)
    },
    ghost: async function (context, criteria) {
      const { directory = false, post } = criteria
      const item = await context.dispatch('load', criteria)

      await context.dispatch('select', { item })

      if (!item.expanded) {
        await context.dispatch('toggle', { item })
      }

      context.commit('haunt', { item, directory, post })

      const ghost = context.state.directory[context.state.ghost]
      await context.dispatch('select', { item: ghost })

      return ghost
    },
    reselect: async function (context) {
      if (!context.state.active) {
        return
      }

      const item = context.state.directory[context.state.active]
      await context.dispatch('select', { item })
    },
    select: async function (context, criteria) {
      let item = await context.dispatch('load', criteria)

      if (!item && context.state.active) {
        item = context.state.directory[context.state.active]
      }

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
    debounce_save,
    debounce_flush: async function () {
      await debounce_save.flush()
    },
    submit: async function (context, criteria) {
      const { input, title } = criteria

      if (context.state.selected === '') {
        throw new FileNotSelectedError('No File Selected')
      }

      const selected = context.state.directory[context.state.selected]
      const { ephemeral, parent, directory } = selected

      context.commit('edit', { edit: false })

      let name = input.toLowerCase().replace(/[ .-]+/g, '.').replace(/[^\d.a-z-]/g, '')

      if (title && !directory) {
        name = `${name}.md`
      }

      let item

      ephemeral
        ? item = await context.dispatch('create', { item: parent, name, directory })
        : item = await context.dispatch('rename', { item: selected, name })

      if (item === undefined) {
        throw new FileSubmitFailureError()
      }

      await context.dispatch('select', { item })

      if (context.state.post) {
        await context.state.post(item.path || '')
      }

      return item
    },
    edit: async function (context, criteria) {
      const item = await context.dispatch('select', criteria)
      context.commit('edit', { edit: true })

      return item
    },
    blur: async function (context) {
      const selected = context.state.directory[context.state.selected]

      context.commit('edit', { edit: false })
      context.commit('blur')

      return selected
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
