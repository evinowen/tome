import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'
import store from '@/store'
import RepositoryButton from '@/components/RepositoryButton.vue'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

Vue.use(Vuetify)

describe('RepositoryButton.vue', () => {
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

    wrapper.setData({ value: true })
    expect(wrapper.vm.value).toBe(true)

    const path = '/project'
    await wrapper.vm.open(path)

    const [action = null, data = null] = store.dispatch.mock.calls.find(([action]) => action === 'files/select')

    expect(action).toBeDefined()
    expect(data).toEqual({ path })
  })

  it('should set value to false open is called with a path', async () => {
    const wrapper = factory.wrap()

    wrapper.setData({ value: true })
    expect(wrapper.vm.value).toBe(true)

    const path = '/project'
    await wrapper.vm.open(path)

    expect(wrapper.vm.value).toBe(false)
  })
})
