import Vue from 'vue'
import Vuetify from 'vuetify'

import PushRemoteSelector from '@/components/PushRemoteSelector.vue'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('PushRemoteSelector.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    vuetify = new Vuetify()

    wrapper = mount(
      PushRemoteSelector,
      {
        localVue,
        vuetify
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should emit a "create" event when the create method is called', async () => {
    const event = jest.fn()

    wrapper.vm.$on('create', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.create()

    expect(event).toHaveBeenCalledTimes(1)
  })

  it('should emit a "input" event when the create method is called', async () => {
    const event = jest.fn()

    wrapper.vm.$on('input', event)

    expect(event).toHaveBeenCalledTimes(0)

    await wrapper.vm.input()

    expect(event).toHaveBeenCalledTimes(1)
  })
})
