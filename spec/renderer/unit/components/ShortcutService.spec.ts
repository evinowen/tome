import { assemble } from '?/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'
import * as VueShortKey from 'vue-shortkey'
import store from '@/store'
import ShortcutService from '@/components/ShortcutService.vue'

jest.mock('@/store', () => ({
  state: {
    system: {
      settings: false,
      console: false,
      patch: false,
      search: false,
      branch: false,
      push: false,
      commit: false,
      edit: false
    }
  },
  dispatch: jest.fn()
}))

Vue.use(VueShortKey)

describe('components/ShortcutService', () => {
  let vuetify

  const factory = assemble(ShortcutService)
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

  it('should dispatch system/settings with true when escape is called and no flags are set', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ShortcutService

    await local.escape()

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/settings')

    expect(action).toBeDefined()
    expect(data).toEqual(true)
  })

  it('should dispatch system flag for layer name with inverse value when layer is called with a layer name', async () => {
    const mocked_store = jest.mocked(store)
    const value = mocked_store.state.system.commit
    const wrapper = factory.wrap()
    const local = wrapper.vm as ShortcutService

    const layer = 'commit'
    await local.layer(layer)

    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/commit')

    expect(action).toBeDefined()
    expect(data).toEqual(!value)
  })

  it('should dispatch system/perform with perform name when perform is called with a name', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ShortcutService

    const performance = 'example-performance'
    await local.perform(performance)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'system/perform')

    expect(action).toBeDefined()
    expect(data).toEqual(performance)
  })

  it('should dispatch library/select when select is called', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as ShortcutService

    await local.select()

    const mocked_store = jest.mocked(store)
    const [action] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'library/select')

    expect(action).toBeDefined()
  })
})
