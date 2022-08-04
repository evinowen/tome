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

  it('should set the search query when the query action is dispatched', async () => {
    const query = 'example search'

    expect(store.state.search.query).toBeNull()

    await store.dispatch('search/query', { query })

    expect(store.state.search.query).toBe(query)
  })

  it('should clear the search query when the clear action is dispatched', async () => {
    const query = 'example search'

    expect(store.state.search.query).toBeNull()

    await store.dispatch('search/query', { query })

    expect(store.state.search.query).toBe(query)

    await store.dispatch('search/clear')

    expect(store.state.search.query).toBeNull()
  })

  it('should store results when query is set', async () => {
    const query = 'example search'

    expect(store.state.search.query).toBeNull()
    expect(store.state.search.results).toBeNull()

    await store.dispatch('search/query', { query })

    expect(store.state.search.query).toBe(query)
    expect(store.state.search.results).toBeDefined()
  })

  it('should update assign navigation when the navigate action is dispatched', async () => {
    const navigation = { target: 10, total: 100 }

    expect(store.state.search.navigation.target).toBe(1)
    expect(store.state.search.navigation.total).toBe(0)

    await store.dispatch('search/navigate', navigation)

    expect(store.state.search.navigation.target).toBe(10)
    expect(store.state.search.navigation.total).toBe(100)
  })

  it('should retain total when the navigate action is dispatched with only target', async () => {
    const navigation = { target: 10, total: 100 }

    expect(store.state.search.navigation.target).toBe(1)
    expect(store.state.search.navigation.total).toBe(0)

    await store.dispatch('search/navigate', navigation)

    expect(store.state.search.navigation.target).toBe(10)
    expect(store.state.search.navigation.total).toBe(100)

    await store.dispatch('search/navigate', { target: 20 })

    expect(store.state.search.navigation.target).toBe(20)
    expect(store.state.search.navigation.total).toBe(100)
  })

  it('should retain target when the navigate action is dispatched with only total', async () => {
    const navigation = { target: 10, total: 100 }

    expect(store.state.search.navigation.target).toBe(1)
    expect(store.state.search.navigation.total).toBe(0)

    await store.dispatch('search/navigate', navigation)

    expect(store.state.search.navigation.target).toBe(10)
    expect(store.state.search.navigation.total).toBe(100)

    await store.dispatch('search/navigate', { total: 200 })

    expect(store.state.search.navigation.target).toBe(10)
    expect(store.state.search.navigation.total).toBe(200)
  })

  it('should increment navigation when the next action is dispatched', async () => {
    const navigation = { target: 10, total: 100 }

    expect(store.state.search.navigation.target).toBe(1)
    expect(store.state.search.navigation.total).toBe(0)

    await store.dispatch('search/navigate', navigation)

    expect(store.state.search.navigation.target).toBe(10)
    expect(store.state.search.navigation.total).toBe(100)

    await store.dispatch('search/next')
    expect(store.state.search.navigation.target).toBe(11)
  })

  it('should decrement navigation when the previous action is dispatched', async () => {
    const navigation = { target: 10, total: 100 }

    expect(store.state.search.navigation.target).toBe(1)
    expect(store.state.search.navigation.total).toBe(0)

    await store.dispatch('search/navigate', navigation)

    expect(store.state.search.navigation.target).toBe(10)
    expect(store.state.search.navigation.total).toBe(100)

    await store.dispatch('search/previous')
    expect(store.state.search.navigation.target).toBe(9)
  })

  it('should wrap navigation when the target equals one and the next action is dispatched', async () => {
    const navigation = { target: 100, total: 100 }

    expect(store.state.search.navigation.target).toBe(1)
    expect(store.state.search.navigation.total).toBe(0)

    await store.dispatch('search/navigate', navigation)

    expect(store.state.search.navigation.target).toBe(100)
    expect(store.state.search.navigation.total).toBe(100)

    await store.dispatch('search/next')
    expect(store.state.search.navigation.target).toBe(1)
  })

  it('should wrap navigation when the target equals one and the previous action is dispatched', async () => {
    const navigation = { target: 1, total: 100 }

    expect(store.state.search.navigation.target).toBe(1)
    expect(store.state.search.navigation.total).toBe(0)

    await store.dispatch('search/navigate', navigation)

    expect(store.state.search.navigation.target).toBe(1)
    expect(store.state.search.navigation.total).toBe(100)

    await store.dispatch('search/previous')
    expect(store.state.search.navigation.target).toBe(navigation.total)
  })
})
