import Vue from 'vue'
import Vuetify from 'vuetify'

import PushPassphraseInput from '@/components/PushPassphraseInput.vue'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('PushPassphraseInput.vue', () => {
  let vuetify
  let wrapper

  let value
  let stored

  beforeEach(() => {
    vuetify = new Vuetify()

    value = null
    stored = null

    wrapper = mount(
      PushPassphraseInput,
      {
        localVue,
        vuetify,
        propsData: {
          value,
          stored
        }
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set the load button color to "grey" when there is no stored value', async () => {
    expect(wrapper.vm.button_color).toEqual('grey')
  })

  it('should set the load button color to "orange" when there is a stored value', async () => {
    await wrapper.setProps({ stored: './test_key.pub' })

    expect(wrapper.vm.button_color).toEqual('orange')
  })
})
