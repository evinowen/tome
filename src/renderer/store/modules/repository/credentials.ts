import { MutationTree, ActionTree } from 'vuex'
import api from '@/api'

export interface State {
  type?: string
  username?: string
  password?: string
  key?: string
  passphrase?: string
}

export const StateDefaults = (): State => ({
  type: '',
  username: undefined,
  password: undefined,
  key: undefined,
  passphrase: undefined,
})

export default {
  namespaced: true,
  state: StateDefaults,
  mutations: <MutationTree<State>>{
    set: function (state, data) {
      Object.assign(state, data)
    },
  },
  actions: <ActionTree<State, unknown>>{
    load: async function (context) {
      const type = await context.dispatch('configuration/read', 'credential_type', { root: true })
      const username = await context.dispatch('configuration/read', 'username', { root: true })
      const password = await context.dispatch('configuration/read', 'password', { root: true })
      const key = await context.dispatch('configuration/read', 'private_key', { root: true })
      const passphrase = await context.dispatch('configuration/read', 'passphrase', { root: true })

      context.commit('set', {
        type,
        username,
        password,
        key,
        passphrase,
      })

      switch (context.state.type) {
        case 'password': {
          const { username, password } = context.state
          await api.repository.credential_password(username, password)
          break
        }

        case 'key': {
          const { key: private_key, passphrase } = context.state
          const { path: public_key } = await api.ssl.generate_public_key(private_key, passphrase)
          await api.repository.credential_key(private_key, public_key, passphrase)
          break
        }
      }
    },
  },
}
