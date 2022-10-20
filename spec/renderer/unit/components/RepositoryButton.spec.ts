import { assemble } from '?/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'
import store from '@/store'
import RepositoryButton from '@/components/RepositoryButton.vue'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

Vue.use(Vuetify)

describe('components/RepositoryButton', () => {
  let vuetify

  const factory = assemble(RepositoryButton)
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

  it('should dispatch files/select with path when open is called with a path', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as RepositoryButton

    wrapper.setData({ value: true })
    expect(local.value).toBe(true)

    const path = '/project'
    await local.open(path)

    const mocked_store = jest.mocked(store)
    const [action, data] = mocked_store.dispatch.mock.calls.find(([action]) => (action as unknown as string) === 'files/select')

    expect(action).toBeDefined()
    expect(data).toEqual({ path })
  })

  it('should set value to false open is called with a path', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as RepositoryButton

    wrapper.setData({ value: true })
    expect(local.value).toBe(true)

    const path = '/project'
    await local.open(path)

    expect(local.value).toBe(false)
  })
})
