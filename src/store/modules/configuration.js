import { remote } from 'electron'

export default {
  state: {
    name: '',
    email: '',
    private_key: '',
    public_key: '',
    passphrase: ''
  },
  mutations: {
    set: function (state, data) {
      for (const item in data) {
        state[item] = data[item]
      }
    }
  },
  actions: {
    loadConfiguration: async function (context, target) {
      const fs = remote.require('fs')
      const raw = await new Promise((resolve, reject) =>
        fs.readFile(
          target,
          'utf8',
          (err, data) => err ? reject(err) : resolve(data)
        )
      )

      const data = JSON.parse(raw) || {}

      context.commit('set', data)
    },
    updateConfiguration: async function (context, data) {
      context.commit('set', data)
    },
    writeConfiguration: async function (context, path) {
      const fs = remote.require('fs')
      await new Promise((resolve, reject) =>
        fs.writeFile(
          path,
          JSON.stringify(context.state),
          'utf8',
          (err) => err ? reject(err) : resolve()
        )
      )
    }
  }
}
