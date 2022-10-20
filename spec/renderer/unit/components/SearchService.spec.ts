import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import SearchService from '@/components/SearchService.vue'

jest.mock('@/store', () => ({
  state: {
    search: {
      case_sensitive: false,
      status: undefined,
      index: undefined,
      query: undefined,
      navigation: {
        target: 0,
        total: 0
      },
      multifile: false,
      regex_query: false,
      results: undefined
    },
    repository: {
      path: '/project'
    }
  },
  dispatch: jest.fn()
}))

describe('components/SearchService', () => {
  let vuetify

  const factory = assemble(SearchService)
    .context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should dispatch search/query with query when update is called with a query', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as SearchService

    const query = '/project'
    await local.update(query)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'search/query')

    expect(action).toBeDefined()
    expect(data).toEqual({ path: store.state.repository.path, query })
  })

  it('should dispatch search/next when next is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as SearchService

    await local.next()

    const mocked_store = jest.mocked(store)
    const [action] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'search/next')

    expect(action).toBeDefined()
  })

  it('should dispatch search/previous when previous is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as SearchService

    await local.previous()

    const mocked_store = jest.mocked(store)
    const [action] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'search/previous')

    expect(action).toBeDefined()
  })

  it('should dispatch files/select with path when select is called with path', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as SearchService

    const path = '/project/file.md'
    await local.select(path)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'files/select')

    expect(action).toBeDefined()
    expect(data).toEqual({ path })
  })

  it('should dispatch search/navigate with target when select is called with a positive target', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as SearchService

    const path = '/project/file.md'
    const target = 1
    const total = 1
    await local.select(path, target, total)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'search/navigate')

    expect(action).toBeDefined()
    expect(data).toEqual({ target, total })
  })
})
