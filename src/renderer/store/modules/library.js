import os from 'os'

export default {
  namespaced: true,
  state: {
    path: '',
    history: []
  },
  mutations: {
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
  actions: {
    load: async function (context, path) {
      const history = []

      if (await window.api.file.exists(path)) {
        const raw = await window.api.file.contents(path)

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

      await context.dispatch('tome/load', path, { root: true })
      await context.dispatch('files/initialize', { path: path }, { root: true })
      await context.dispatch('tome/inspect', null, { root: true })
    },
    close: async function (context, path) {
      await context.dispatch('tome/clear', null, { root: true })
      await context.dispatch('files/clear', null, { root: true })
    },
    add: async function (context, path) {
      context.commit('add', path)
      await context.dispatch('record')
    },
    remove: async function (context, path) {
      context.commit('remove', path)
      await context.dispatch('record')
    },
    record: async function (context) {
      let content = ''

      for (const path of context.state.history) {
        content += String(path).concat(os.EOL)
      }

      await window.api.file.write(context.state.path, content)
    }
  }
}
