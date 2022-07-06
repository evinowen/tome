import Vue from 'vue'
import Vuetify from 'vuetify'

import CommitConfirm from '@/components/CommitConfirm.vue'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('CommitConfirm.vue', () => {
  let vuetify
  let wrapper

  beforeEach(() => {
    vuetify = new Vuetify()

    wrapper = mount(
      CommitConfirm,
      {
        localVue,
        vuetify
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set status to ready message when staging is false', async () => {
    wrapper.setProps({ staging: false })

    expect(wrapper.vm.status).toEqual('Commit is prepared and ready to publish')
  })
})
