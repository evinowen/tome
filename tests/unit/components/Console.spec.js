import Vue from 'vue'
import Vuetify from 'vuetify'

import Console from '@/components/Console.vue'
import store from '@/store'

import { createLocalVue, mount } from '@vue/test-utils'
import { DateTime } from 'luxon'

jest.mock('@/store', () => ({ state: {}, dispatch: jest.fn() }))

Vue.use(Vuetify)

const localVue = createLocalVue()

describe('Console.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    vuetify = new Vuetify()

    store.state = {
      events: [
        { type: 'info', message: 'Message 1', datetime: DateTime.now().minus({ minutes: 120 }) },
        { type: 'error', message: 'Message 2', datetime: DateTime.now().minus({ minutes: 60 }) },
        { type: 'info', message: 'Message 3', datetime: DateTime.now().minus({ minutes: 45 }) },
        { type: 'error', message: 'Message 4', datetime: DateTime.now().minus({ minutes: 30 }) },
        { type: 'error', message: 'Message 5', datetime: DateTime.now().minus({ minutes: 15 }) }
      ]
    }

    const value = true

    wrapper = mount(
      Console,
      {
        localVue,
        vuetify,
        propsData: {
          value
        }
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should mount and set prop and data defaults', async () => {
    expect(wrapper.vm.value).toEqual(true)
  })
})
