import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'

import store from '@/store'
import SearchService from '@/components/SearchService.vue'

Vue.use(Vuetify)

jest.mock('@/store', () => ({
  state: {
    tome: {
      name: 'project',
      path: '/project'
    },
    configuration: {
      format_titles: false
    },
    files: {
      active: null,
      content: null,
      error: null,
      tree: {}
    },
    search: {
      query: null
    }
  },
  dispatch: jest.fn()
}))

describe('SearchService', () => {
  let vuetify

  const factory = assemble(SearchService).context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call store file save action for item path provided by save event', async () => {
    const query = 'test query'

    const wrapper = factory.wrap()
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.update(query)

    expect(store.dispatch).toHaveBeenCalledTimes(1)
    expect(store.dispatch.mock.calls[0][0]).toBe('search/query')
  })
})
