import { MutationTree, ActionTree } from 'vuex'
// import * as os from 'os'

export class State {
  path: string = ''
  history: string[] = []
}

export default {
  namespaced: true,
  state: new State,
  mutations: <MutationTree<State>>{
    set: function (state, data) {
      const { path, history } = data
      state.path = path
      state.history.push(...history)
    },
    add: function (state, path) {
      const index = state.history.indexOf(path)

      if (index < 0) {
        state.history.push(path)
      }
    },
    remove: function (state, path) {
      const index = state.history.indexOf(path)

      if (index >= 0) {
        state.history.splice(index, 1)
      }
    }
  },
  actions: <ActionTree<State, any>>{
    load: async function (context, path) {
      const history = []

      if (await window.api.file.exists(path)) {
        console.log('file.contents library actions', path)
        const raw = await window.api.file.contents(path)
        console.log('file.contents library actions')

        if (raw) {
          const lines = raw.split(/[\n\r]+/).map(line => line.trim())

          for (const line of lines) {
            if (line !== '') {
              history.push(line)
            }
          }
        }
      }

      context.commit('set', { path, history })
    },
    select: async function (context) {
      const result = await window.api.file.select_directory()

      if (result.canceled) {
        return
      }

      const path = result.filePaths.shift()
      await context.dispatch('open', path)
    },
    open: async function (context, path) {
      await context.dispatch('add', path)

      await context.dispatch('repository/load', path, { root: true })
      await context.dispatch('files/initialize', { path: path }, { root: true })
      await context.dispatch('repository/inspect', null, { root: true })
    },
    close: async function (context) {
      await context.dispatch('repository/clear', null, { root: true })
      await context.dispatch('files/clear', null, { root: true })
    },
    add: async function (context, path) {
      context.commit('add', path)
      // await context.dispatch('record')
    },
    remove: async function (context, path) {
      context.commit('remove', path)
      // await context.dispatch('record')
    },
    record: async function (context) {
      // let content = ''

      // for (const path of context.state.history) {
      //   content += String(path).concat(os.EOL)
      // }

      // // TODO: Move use of os module to main where it belongs
      // await window.api.file.write(context.state.path, content)
    }
  }
}
