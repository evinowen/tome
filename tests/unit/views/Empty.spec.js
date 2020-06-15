import { assemble } from 'tests/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'

import EmptyView from '@/views/Empty.vue'

Vue.use(Vuetify)

jest.mock('@/store', () => ({
  state: {}
}))

describe('Empty.vue', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const factory = assemble(EmptyView)
    .context(() => ({ vuetify }))

  it('is able to be mocked and prepared for testing', () => {
    const wrapper = factory.wrap()

    expect(wrapper).not.toBeNull()
  })
})
