import { cloneDeep } from 'lodash'
import Vuex from 'vuex'

import files from './modules/files'
import search from './modules/search'
import { vi } from 'vitest'

export default function () {
  return new Vuex.Store({
    state: {
      repository: {
        name: 'project',
        path: '/project',
      },
      configuration: {
        format_titles: false,
      },
    },
    modules: {
      files: cloneDeep(files),
      search: cloneDeep(search),
    },
  })
}

export function scafold (config) {
  return cloneDeep({
    actions: {
      message: vi.fn(),
      error: vi.fn(),
    },
    ...config,
  })
}

export function stub_actions (list: string[]) {
  const result = {}

  for (const action of list) {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    result[action] = () => {}
  }

  return result
}
