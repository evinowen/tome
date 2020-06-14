import Vue from 'vue'
import Vuetify from 'vuetify'

import StatusButton from '@/components/StatusButton.vue'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)

const localVue = createLocalVue()

describe('StatusButton.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    vuetify = new Vuetify()

    wrapper = mount(
      StatusButton,
      {
        localVue,
        vuetify,
        stubs: {
        },
        propsData: {
          waiting: 0,
          available_new: 8,
          available_renamed: 4,
          available_modified: 2,
          available_removed: 1,
          staged_new: 11,
          staged_renamed: 9,
          staged_modified: 7,
          staged_removed: 5
        }
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should calculate updated available files', async () => {
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.available_added).toEqual(14)
  })

  it('should calculate updated staged files', async () => {
    await expect(wrapper.vm.$nextTick()).resolves.toBeDefined()

    expect(wrapper.vm.staged_added).toEqual(27)
  })
})
