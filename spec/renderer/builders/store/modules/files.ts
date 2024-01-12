import { vi } from 'vitest'
import { cloneDeep } from 'lodash'
import files from '@/store/modules/files'

const template = cloneDeep(files.state)

const mock = {
  mutation: (state, data) => {
    let target = state

    if (data.__target) {
      const path = String(data.__target).split('.')
      delete data.__target

      for (;;) {
        const key = path.shift()

        if (!key) {
          break
        }

        target = target[key]
      }
    }

    for (const [key, value] of Object.entries(data)) {
      target[key] = value
    }
  },
  action: async (context, data) => context.commit('mock', data)
}

export default {
  namespaced: true,
  state: cloneDeep(template),
  mutations: { mock: mock.mutation },
  // eslint-disable-next-line unicorn/no-array-reduce
  actions: Object.keys(files.actions).reduce((object, target) => Object.assign(object, { [target]: vi.fn() }), { mock: mock.action })
}
