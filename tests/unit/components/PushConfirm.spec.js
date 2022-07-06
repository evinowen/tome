import Vue from 'vue'
import Vuetify from 'vuetify'

import PushConfirm from '@/components/PushConfirm.vue'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('PushConfirm.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    vuetify = new Vuetify()

    wrapper = mount(
      PushConfirm,
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
    expect(wrapper.vm.value).toEqual(false)
    expect(wrapper.vm.disabled).toEqual(false)
    expect(wrapper.vm.waiting).toEqual(false)
    expect(wrapper.vm.history).toEqual([])
    expect(wrapper.vm.headers).toEqual([
      { text: '', value: 'oid', width: '60px' },
      { text: '', value: 'message', width: '' }
    ])
  })
})
