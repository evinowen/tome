import { cloneDeep } from 'lodash'
import files from '@/store/modules/files'

const template = cloneDeep(files.state)

const mock = {
  mutation: async (state, data) => {
    if (data.reset) {
      Object.assign(state, template)
      return
    }

    Object.entries(data).forEach(([key, value]) => state[key] = value)
  },
  action: async (context, data) => context.commit('mock', data)
}

export default {
  namespaced: true,
  state: cloneDeep(template),
  mutations: { mock: mock.mutation },
  actions: Object.keys(files.actions).reduce((object, target) => Object.assign(object, { [target]: jest.fn() }), { mock: mock.action })
}
