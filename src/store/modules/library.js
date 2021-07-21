import { remote } from 'electron'
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
      const fs = remote.require('fs')
      const history = []

      if (fs.existsSync(path)) {
        const file_stream = fs.createReadStream(path)

        const readline = remote.require('readline')
        const read_interface = readline.createInterface({
          input: file_stream,
          crlfDelay: Infinity
        })

        for await (const line of read_interface) {
          console.log(`Line from file: ${line}`)
          history.push(line)
        }
      }

      context.commit('set', { path, history })
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

      const fs = remote.require('fs')

      await new Promise((resolve, reject) =>
        fs.writeFile(context.state.path, content, (err) => err ? reject(err) : resolve(true))
      )
    }
  }
}
