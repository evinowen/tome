import { cloneDeep } from 'lodash'
import files from '@/store/modules/files'

const template = cloneDeep(files.state)

const mock = {
  mutation: (state, data) => {
    let target = state

    if (data.__target) {
      const path = String(data.__target).split('.')
      delete data.__target

      let key
      while (key = path.shift()) {
        target = target[key]
      }
    }

    Object.entries(data).forEach(([key, value]) => { target[key] = value })
  },
  action: async (context, data) => context.commit('mock', data)
}

export default {
  namespaced: true,
  state: cloneDeep(template),
  mutations: { mock: mock.mutation },
  actions: Object.keys(files.actions).reduce((object, target) => Object.assign(object, { [target]: jest.fn() }), { mock: mock.action })
}
