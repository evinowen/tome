import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import SearchService from '@/components/SearchService.vue'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

describe('SearchService.vue', () => {
  let vuetify

  const factory = assemble(SearchService)
    .context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()

    store.state = {
      search: {
        case_sensitive: false,
        status: null,
        index: null,
        query: null,
        navigation: {
          target: 0,
          total: 0
        },
        multifile: false,
        regex_query: false,
        results: null
      },
      tome: {
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

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'search/query')

    expect(action).toBeDefined()
    expect(data).toEqual({ path: store.state.tome.path, query })
  })

  it('should dispatch search/next when next is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.next()

    const [action = null] = store.dispatch.mock.calls.find(([action]) => action === 'search/next')

    expect(action).toBeDefined()
  })

  it('should dispatch search/previous when previous is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.previous()

    const [action = null] = store.dispatch.mock.calls.find(([action]) => action === 'search/previous')

    expect(action).toBeDefined()
  })

  it('should dispatch files/select with path when select is called with path', async () => {
    const wrapper = factory.wrap()

    const path = '/project/file.md'
    await wrapper.vm.select(path)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'files/select')

    expect(action).toBeDefined()
    expect(data).toEqual({ path })
  })

  it('should dispatch search/navigate with target when select is called with a positive target', async () => {
    const wrapper = factory.wrap()

    const path = '/project/file.md'
    const target = 1
    const total = 1
    await wrapper.vm.select(path, target, total)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'search/navigate')

    expect(action).toBeDefined()
    expect(data).toEqual({ target, total })
  })
})
