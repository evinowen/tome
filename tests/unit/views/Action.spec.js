import { assemble } from '@/../tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'

import ActionView from '@/views/Action.vue'

Vue.use(Vuetify)

jest.mock('@/store', () => ({
  state: {}
}))

describe('Action.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const factory = assemble(ActionView, () => ({ vuetify }))

  it('is able to be mocked and prepared for testing', () => {
    const wrapper = factory.wrap()

    expect(wrapper).not.toBeNull()
  })
})
