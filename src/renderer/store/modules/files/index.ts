import Vue from 'vue'
import { MutationTree, ActionTree, GetterTree } from 'vuex'
import File, { FileLoadContract, FileLoadPayload } from './file'
import FileTree, { FileIdentity, FileIdentityContract } from './file_tree'

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
  content?: string
  tree?: FileTree
  ghost?: File
  base?: File
  selected?: File
  editing = false
  post?: (path: string) => void
}

export default {
  namespaced: true,
  state: new State,
  mutations: <MutationTree<State>>{
    initialize: function (state, tree) {
      state.tree = tree
      state.base = tree.base
      state.path = tree.base.path
      Vue.set(state.directory, state.path, tree.base)
    },
    clear: function (state) {
      state.tree = undefined
    },
    load: function (state, contract: FileLoadContract) {
      const { item, payload } = contract

      if (item.directory) {
        item.fill(payload)

        for (const file of payload.children) {
          Vue.set(state.directory, file.path, file)
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

      state.active = item.path
      state.selected = item

      if (!item.directory && item.document) {
        state.content = item.document.content
      }
    },
    edit: function (state, data) {
      const { edit } = data
      state.editing = edit

      if (!state.editing && state.selected?.ephemeral && state.ghost !== undefined) {
        state.ghost.exercise()
        state.ghost = undefined
      }
    },
    haunt: function (state, data) {
      const { item, directory, post } = data

      item.directory
        ? state.ghost = item.haunt(directory)
        : state.ghost = item.parent.haunt(directory, item)

      state.post = post
      state.editing = true
    },
    blur: function (state) {
      state.selected = undefined
    }
  },
  getters: <GetterTree<State, unknown>>{
    tree_base: function (state): File|undefined {
      return state.base
    }
  },
  actions: <ActionTree<State, unknown>>{
    initialize: async function (context, { path }) {
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

        switch (event) {
          case ChokidarEvent.ADD:
          case ChokidarEvent.ADD_DIR:
          case ChokidarEvent.DELETE:
          case ChokidarEvent.DELETE_DIR:
            context.commit('unload', parent || item)
            await context.dispatch('load', { item: parent || item })
            break
        }
      })

      await context.dispatch('toggle', context.state.base)
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
          const contract = await identity.item.load()
          context.commit('load', contract)

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
      const item = await context.dispatch('identify', criteria)

      if (!item.ephemeral) {
        const contract = await item.load()
        context.commit('load', contract)
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
    submit: async function (context, criteria) {
      const { input, title } = criteria

      if (context.state.selected === undefined) {
        throw new FileNotSelectedError()
      }

      context.commit('edit', { edit: false })

      let name = input.toLowerCase().replace(/[ .-]+/g, '.').replace(/[^\d.a-z-]/g, '')

      const { ephemeral, parent, directory } = context.state.selected

      if (title && !directory) {
        name = `${name}.md`
      }

      let item

      ephemeral
        ? item = await context.dispatch('create', { item: parent, name, directory })
        : item = await context.dispatch('rename', { item: context.state.selected, name })

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
