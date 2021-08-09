import Vue from 'vue'
import Vuetify from 'vuetify'
import VueShortKey from 'vue-shortkey'

import RepositoryButton from '@/components/RepositoryButton.vue'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)
Vue.use(VueShortKey)

const localVue = createLocalVue()

describe('Console.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    vuetify = new Vuetify()

    wrapper = mount(
      RepositoryButton,
      {
        localVue,
        vuetify
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should emit open event with path and close on call to open', async () => {
    const event = jest.fn()

    wrapper.setData({ value: true })

    wrapper.vm.$on('open', event)

    expect(event).toHaveBeenCalledTimes(0)
    expect(wrapper.vm.value).toBe(true)

    const path = '/readme.md'

    wrapper.vm.open(path)

    expect(event).toHaveBeenCalledTimes(1)
    expect(event.mock.calls[0][0]).toEqual(path)
    expect(wrapper.vm.value).toBe(false)
  })
})
