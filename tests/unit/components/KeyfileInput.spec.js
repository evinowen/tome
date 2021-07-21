import Vue from 'vue'
import Vuetify from 'vuetify'

import KeyfileInput from '@/components/KeyfileInput.vue'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('KeyfileInput.vue', () => {
  let vuetify
  let wrapper

  let file

  beforeEach(() => {
    vuetify = new Vuetify()

    file = {
      path: './test_key.pub'
    }

    const value = null
    const label = null
    const id = null

    wrapper = mount(
      KeyfileInput,
      {
        localVue,
        vuetify,
        propsData: {
          value,
          label,
          id
        }
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should emit "input" event when input method is called and file is selected', async () => {
    const event = jest.fn()

    wrapper.vm.$on('input', event)

    expect(event).toHaveBeenCalledTimes(0)

    const input_event = {
      target: {
        files: [ file ]
      }
    }

    await wrapper.vm.input(input_event)

    expect(event).toHaveBeenCalledTimes(1)
  })
})
