import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import Branch from '@/components/Branch.vue'

jest.mock('@/store', () => ({
  state: {
    repository: {
      history: []
    }
  },
  dispatch: jest.fn()
}))

describe('components/Branch', () => {
  let vuetify
  let value

  const factory = assemble(Branch, { value })
    .context(() => ({
      vuetify,
      stubs: { VDataTable: true }
    }))

  beforeEach(() => {
    vuetify = new Vuetify()
    value = true
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch system/branch with false when close is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Branch

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await local.close()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/branch')

    expect(action).toBeDefined()
    expect(data).toEqual(false)
  })

  it('should call store to load commit OID into patch when diff is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Branch

    const event = jest.fn()

    local.$on('edit', event)

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await local.diff({ oid: 1 })

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'repository/diff')

    expect(action).toBeDefined()
    expect(data).toEqual({ commit: 1 })
  })

  it('should dispatch system/patch with true when diff is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Branch

    const event = jest.fn()

    local.$on('patch', event)

    expect(event).toHaveBeenCalledTimes(0)

    await local.diff({ oid: 1 })

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/patch')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should format date into ISO format on call to format_date', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Branch

    const event = jest.fn()

    local.$on('patch', event)

    expect(event).toHaveBeenCalledTimes(0)

    const date = new Date('2000-01-01T12:00:00')

    const result = local.format_date(date)

    expect(result).toEqual('2000-01-01')
  })
})
