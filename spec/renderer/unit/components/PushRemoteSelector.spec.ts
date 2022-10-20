import { assemble } from '?/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'

import PushRemoteSelector from '@/components/PushRemoteSelector.vue'

Vue.use(Vuetify)

describe('components/PushRemoteSelector', () => {
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
    const local = wrapper.vm as PushRemoteSelector
    local.$on('create', event)

    expect(event).toHaveBeenCalledTimes(0)

    await local.create()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit a "input" event when the create method is called', async () => {
    const event = jest.fn()

    const wrapper = factory.wrap()
    const local = wrapper.vm as PushRemoteSelector
    local.$on('input', event)

    expect(event).toHaveBeenCalledTimes(0)

    const remote = {}
    await local.input(remote)

    expect(event).toHaveBeenCalledTimes(1)
  })
})
