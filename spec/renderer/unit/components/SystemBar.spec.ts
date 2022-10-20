import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import SystemBar from '@/components/SystemBar.vue'

jest.mock('@/store', () => ({
  state: {
    system: {
      maximized: false,
      settings: false
    }
  },
  dispatch: jest.fn()
}))

describe('components/SystemBar', () => {
  const title = 'Test Title'

  let vuetify

  const factory = assemble(SystemBar, { title })
    .context(() => ({ vuetify, stubs: { VIcon: true } }))

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(async () => {
    jest.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should dispatch system/settings with inverted settings value when settings is called', async () => {
    const value = store.state.system.settings
    const wrapper = factory.wrap()
    const local = wrapper.vm as SystemBar

    await local.settings()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/settings')

    expect(action).toBeDefined()
    expect(data).toEqual(!value)
  })

  it('should dispatch system/minimize when minimize is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as SystemBar

    await local.minimize()

    const mocked_store = jest.mocked(store)
    const [action] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/minimize')

    expect(action).toBeDefined()
  })

  it('should dispatch system/maximize when maximize is called and window is not maximized', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as SystemBar

    await local.maximize()

    const mocked_store = jest.mocked(store)
    const [action] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/maximize')

    expect(action).toBeDefined()
  })

  it('should dispatch system/restore when maximize is called and window is maximized', async () => {
    store.state.system.maximized = true

    const wrapper = factory.wrap()
    const local = wrapper.vm as SystemBar

    await local.maximize()

    const mocked_store = jest.mocked(store)
    const [action] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/restore')

    expect(action).toBeDefined()
  })

  it('should dispatch system/exit when exit is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as SystemBar

    await local.exit()

    const mocked_store = jest.mocked(store)
    const [action] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/exit')

    expect(action).toBeDefined()
  })
})
