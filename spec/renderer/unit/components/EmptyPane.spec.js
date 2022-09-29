import { assemble } from '?/helpers'
import Vue from 'vue'
import Vuetify from 'vuetify'

import EmptyPane from '@/components/EmptyPane.vue'

Vue.use(Vuetify)

jest.mock('@/store', () => ({
  state: {}
}))

describe('components/EmptyPane', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const factory = assemble(EmptyPane)
    .context(() => ({ vuetify }))

  it('is able to be mocked and prepared for testing', () => {
    const wrapper = factory.wrap()

    expect(wrapper).not.toBeNull()
  })
})
