import { assemble } from '?/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'
import VueShortKey from 'vue-shortkey'
import store from '@/store'
import ShortcutService from '@/components/ShortcutService.vue'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

Vue.use(VueShortKey)

describe('ShortcutService.vue', () => {
  let vuetify

  const factory = assemble(ShortcutService)
    .context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()

    store.state = {
      system: {
        example: false,
        settings: false,
        console: false,
        patch: false,
        search: false,
        branch: false,
        push: false,
        commit: false,
        edit: false
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

  it('should dispatch system/settings with true when escape is called and no flags are set', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.escape()

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/settings')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system flag for layer name with inverse value when layer is called with a layer name', async () => {
    const value = store.state.system.example
    const wrapper = factory.wrap()

    const layer = 'example'
    await wrapper.vm.layer(layer)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/example')

    expect(action).toBeDefined()
    expect(data).toEqual(!value)
  })

  it('should dispatch system/perform with perform name when perform is called with a name', async () => {
    const wrapper = factory.wrap()

    const performance = 'example-performance'
    await wrapper.vm.perform(performance)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'system/perform')

    expect(action).toBeDefined()
    expect(data).toEqual(performance)
  })

  it('should dispatch library/select when select is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.select()

    const [action = null] = store.dispatch.mock.calls.find(([action]) => action === 'library/select')

    expect(action).toBeDefined()
  })
})
