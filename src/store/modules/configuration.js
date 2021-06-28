import { remote } from 'electron'
import Vuetify from '@/plugins/vuetify'

export default {
  namespaced: true,
  state: {
    name: '',
    email: '',
    private_key: '',
    public_key: '',
    passphrase: '',
    format_titles: true,
    dark_mode: true
  },
  mutations: {
    set: function (state, data) {
      for (const item in data) {
        state[item] = data[item]
      }
    }
  },
  actions: {
    load: async function (context, target) {
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

      context.dispatch('present')
    },
    update: async function (context, data) {
      context.commit('set', data)

      context.dispatch('present')
    },
    write: async function (context, path) {
      const fs = remote.require('fs')
      await new Promise((resolve, reject) =>
        fs.writeFile(
          path,
          JSON.stringify(context.state),
          'utf8',
          (err) => err ? reject(err) : resolve()
        )
      )
    },
    present: async function (context) {
      Vuetify.framework.theme.dark = context.state.dark_mode
    }
  }
}
