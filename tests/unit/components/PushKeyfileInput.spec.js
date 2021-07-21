import Vue from 'vue'
import Vuetify from 'vuetify'

import PushKeyfileInput from '@/components/PushKeyfileInput.vue'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('PushKeyfileInput.vue', () => {
  let vuetify
  let wrapper

  let value
  let stored
  let file

  beforeEach(() => {
    vuetify = new Vuetify()

    value = ''
    stored = ''

    file = {
      path: './test_key.pub'
    }

    wrapper = mount(
      PushKeyfileInput,
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

  it('should mount and set prop and data defaults', async () => {
    expect(wrapper.vm.value).toEqual('')
    expect(wrapper.vm.stored).toEqual('')
    expect(wrapper.vm.label).toEqual('')
    expect(wrapper.vm.id).toEqual('')
  })

  it('should set the load text color to "red" when there is no set value', async () => {
    expect(wrapper.vm.color).toEqual('red')
  })

  it('should set the load button color to "green" when there is a set value', async () => {
    wrapper.setProps({ value: './test_key.pub' })

    expect(wrapper.vm.color).toEqual('green')
  })

  it('should set the load button color to "grey" when there is no stored value', async () => {
    expect(wrapper.vm.button_color).toEqual('grey')
  })

  it('should set the load button color to "orange" when there is a stored value', async () => {
    wrapper.setProps({ stored: './test_key.pub' })

    expect(wrapper.vm.button_color).toEqual('orange')
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

  it('should no emit "input" event when input method is called but file is no selected', async () => {
    const event = jest.fn()

    file.path = null

    wrapper.vm.$on('input', event)

    expect(event).toHaveBeenCalledTimes(0)

    const input_event = {
      target: {
        files: [ file ]
      }
    }

    await wrapper.vm.input(input_event)

    expect(event).toHaveBeenCalledTimes(0)
  })
})
