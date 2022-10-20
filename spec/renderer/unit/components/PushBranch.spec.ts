import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import PushBranch from '@/components/PushBranch.vue'

describe('components/PushBranch', () => {
  let vuetify

  const factory = assemble(PushBranch)
    .context(() => ({ vuetify }))

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })
})
