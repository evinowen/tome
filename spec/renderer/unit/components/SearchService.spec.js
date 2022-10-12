import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import SearchService from '@/components/SearchService'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

describe('components/SearchService', () => {
  let vuetify

  const factory = assemble(SearchService)
    .context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()

    store.state = {
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
    }
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

    const query = '/project'
    await wrapper.vm.update(query)

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'search/query')

    expect(action).toBeDefined()
    expect(data).toEqual({ path: store.state.repository.path, query })
  })

  it('should dispatch search/next when next is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.next()

    const [action] = store.dispatch.mock.calls.find(([action]) => action === 'search/next')

    expect(action).toBeDefined()
  })

  it('should dispatch search/previous when previous is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.previous()

    const [action] = store.dispatch.mock.calls.find(([action]) => action === 'search/previous')

    expect(action).toBeDefined()
  })

  it('should dispatch files/select with path when select is called with path', async () => {
    const wrapper = factory.wrap()

    const path = '/project/file.md'
    await wrapper.vm.select(path)

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'files/select')

    expect(action).toBeDefined()
    expect(data).toEqual({ path })
  })

  it('should dispatch search/navigate with target when select is called with a positive target', async () => {
    const wrapper = factory.wrap()

    const path = '/project/file.md'
    const target = 1
    const total = 1
    await wrapper.vm.select(path, target, total)

    const [action, data] = store.dispatch.mock.calls.find(([action]) => action === 'search/navigate')

    expect(action).toBeDefined()
    expect(data).toEqual({ target, total })
  })
})
