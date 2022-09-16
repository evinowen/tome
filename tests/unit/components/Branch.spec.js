import { assemble } from '@/../tests/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import Branch from '@/components/Branch.vue'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

describe('Branch.vue', () => {
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

    store.state = {
      tome: {
        history: []
      }
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should dispatch system/branch with false when close is called', async () => {
    const wrapper = factory.wrap()

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.close()

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/branch')

    expect(action).toBeDefined()
    expect(data).toEqual(false)
  })

  it('should call store to load commit OID into patch when diff is called', async () => {
    const wrapper = factory.wrap()

    const event = jest.fn()

    wrapper.vm.$on('edit', event)

    expect(store.dispatch).toHaveBeenCalledTimes(0)

    await wrapper.vm.diff({ oid: 1 })

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'tome/diff')

    expect(action).toBeDefined()
    expect(data).toEqual({ commit: 1 })
  })

  it('should dispatch system/patch with true when diff is called', async () => {
    const wrapper = factory.wrap()

    const event = jest.fn()

    wrapper.vm.$on('patch', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.diff({ oid: 1 })

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/patch')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should format date into ISO format on call to format_date', async () => {
    const wrapper = factory.wrap()

    const event = jest.fn()

    wrapper.vm.$on('patch', event)

    expect(event).toHaveBeenCalledTimes(0)

    const date = new Date('2000-01-01T12:00:00')

    const result = wrapper.vm.format_date(date)

    expect(result).toEqual('2000-01-01')
  })
})
