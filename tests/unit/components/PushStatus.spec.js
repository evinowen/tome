import Vue from 'vue'
import Vuetify from 'vuetify'

import PushStatus from '@/components/PushStatus.vue'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('PushStatus.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    vuetify = new Vuetify()

    wrapper = mount(
      PushStatus,
      {
        localVue,
        vuetify
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should mount and set prop and data defaults', async () => {
    expect(wrapper.vm.active).toEqual(false)
    expect(wrapper.vm.loading).toEqual(false)
    expect(wrapper.vm.match).toEqual(false)
    expect(wrapper.vm.error).toEqual('')
    expect(wrapper.vm.history).toEqual([])
  })
})
