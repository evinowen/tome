import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import PushConfirm from '@/components/PushConfirm.vue'

describe('components/PushConfirm', () => {
  let vuetify

  const factory = assemble(PushConfirm)
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
