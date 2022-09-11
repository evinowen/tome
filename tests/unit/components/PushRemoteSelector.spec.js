import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'

import PushRemoteSelector from '@/components/PushRemoteSelector.vue'

Vue.use(Vuetify)

describe('PushRemoteSelector.vue', () => {
  let vuetify

  const factory = assemble(PushRemoteSelector)
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

  it('should emit a "create" event when the create method is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    wrapper.vm.$on('create', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.create()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit a "input" event when the create method is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    wrapper.vm.$on('input', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.input()

    expect(event).toHaveBeenCalledTimes(1)
  })
})
