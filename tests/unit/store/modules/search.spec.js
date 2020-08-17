import Vuex from 'vuex'
import { cloneDeep } from 'lodash'

import { createLocalVue } from '@vue/test-utils'
import search from '@/store/modules/search'

jest.mock('electron', () => ({ remote: {} }))

describe('store/modules/search', () => {
  let localVue
  let store

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)

    store = new Vuex.Store(cloneDeep({ modules: { search } }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set the search query when query dispatched', async () => {
    const query = 'example search'

    expect(store.state.search.query).toBeNull()

    await store.dispatch('search/query', { query })

    expect(store.state.search.query).toBe(query)
  })

  it('should clear the search query when clear dispatched', async () => {
    const query = 'example search'

    expect(store.state.search.query).toBeNull()

    await store.dispatch('search/query', { query })

    expect(store.state.search.query).toBe(query)

    await store.dispatch('search/clear')

    expect(store.state.search.query).toBeNull()
  })
})
