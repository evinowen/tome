import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import store from '@/store'
import SystemBar from '@/components/SystemBar.vue'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

describe('SystemBar.vue', () => {
  const title = 'Test Title'

  let vuetify

  const factory = assemble(SystemBar, { title })
    .context(() => ({ vuetify, stubs: { VIcon: true } }))

  beforeEach(() => {
    vuetify = new Vuetify()

    store.state = {
      system: {
        maximized: false,
        settings: false
      }
    }
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

    await wrapper.vm.settings()

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/settings')

    expect(action).toBeDefined()
    expect(data).toEqual(!value)
  })

  it('should dispatch system/minimize when minimize is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.minimize()

    const [action = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/minimize')

    expect(action).toBeDefined()
  })

  it('should dispatch system/maximize when maximize is called and window is not maximized', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.maximize()

    const [action = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/maximize')

    expect(action).toBeDefined()
  })

  it('should dispatch system/restore when maximize is called and window is maximized', async () => {
    store.state.system.maximized = true

    const wrapper = factory.wrap()

    await wrapper.vm.maximize()

    const [action = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/restore')

    expect(action).toBeDefined()
  })

  it('should dispatch system/exit when exit is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.exit()

    const [action = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/exit')

    expect(action).toBeDefined()
  })
})
