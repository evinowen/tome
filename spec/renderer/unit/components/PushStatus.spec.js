import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import PushStatus from '@/components/PushStatus.vue'

describe('PushStatus.vue', () => {
  let vuetify

  const factory = assemble(PushStatus)
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
