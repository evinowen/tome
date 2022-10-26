import Vuex from 'vuex'
import { cloneDeep } from 'lodash'
import { createLocalVue } from '@vue/test-utils'
import search, { State as SearchState } from '@/store/modules/search'
import builders from '?/builders'
import Disk from '../../../mocks/support/disk'
import { set_disk } from '?/builders/window/file'

Object.assign(window, builders.window())

interface State {
  search: SearchState
}

describe('store/modules/search', () => {
  let localVue
  let store

  const disk = new Disk
  set_disk(disk)

  beforeEach(() => {
    disk.reset_disk()

    localVue = createLocalVue()
    localVue.use(Vuex)

    store = new Vuex.Store<State>(cloneDeep({ modules: { search } }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set multifile flag when the multifile action is dispatched', async () => {
    expect(store.state.search.multifile).toBe(false)

    await store.dispatch('search/multifile', true)

    expect(store.state.search.multifile).toBe(true)
  })

  it('should set regex_query flag when the regex_query action is dispatched', async () => {
    expect(store.state.search.regex_query).toBe(false)

    await store.dispatch('search/regex_query', true)

    expect(store.state.search.regex_query).toBe(true)
  })

  it('should set case_sensitive flag when the case_sensitive action is dispatched', async () => {
    expect(store.state.search.case_sensitive).toBe(false)

    await store.dispatch('search/case_sensitive', true)

    expect(store.state.search.case_sensitive).toBe(true)
  })

  it('should return when path is not set and execute is dispatched', async () => {
    expect(store.state.search.path).toBe(undefined)

    await store.dispatch('search/execute')

    expect(window.api.file.search_path).not.toHaveBeenCalled()
  })

  it('should return when query is not set and execute is dispatched', async () => {
    const path = '/project'

    expect(store.state.search.query).toBe('')

    await store.dispatch('search/query', { path, query: undefined })

    await store.dispatch('search/multifile', true)
    await store.dispatch('search/execute')

    expect(window.api.file.search_path).not.toHaveBeenCalled()
  })

  it('should set the search query when the query action is dispatched', async () => {
    const path = '/project'
    const query = 'example search'

    expect(store.state.search.query).toBe('')

    await store.dispatch('search/query', { path, query })

    expect(store.state.search.query).toBe(query)
  })

  it('should not search path if multifile is false when the query action is dispatched', async () => {
    const path = '/project'
    const query = 'example search'

    expect(store.state.search.query).toBe('')

    await store.dispatch('search/query', { path, query })

    expect(window.api.file.search_path).not.toHaveBeenCalled()
  })

  it('should search search path if multifile is false when the query action is dispatched', async () => {
    const path = '/project'
    const query = 'example search'

    expect(store.state.search.query).toBe('')

    await store.dispatch('search/multifile', true)
    await store.dispatch('search/query', { path, query })

    expect(window.api.file.search_path).toHaveBeenCalled()
  })

  it('should clear the search query when the clear action is dispatched', async () => {
    const path = '/project'
    const query = 'example search'

    expect(store.state.search.query).toBe('')

    await store.dispatch('search/query', { path, query })

    expect(store.state.search.query).toBe(query)

    await store.dispatch('search/clear')

    expect(store.state.search.query).toBeUndefined()
  })

  it('should store results when query is set', async () => {
    const path = '/project'
    const query = 'example search'

    expect(store.state.search.query).toBe('')
    expect(store.state.search.results).toEqual([])

    await store.dispatch('search/multifile', true)
    await store.dispatch('search/query', { path, query })

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
