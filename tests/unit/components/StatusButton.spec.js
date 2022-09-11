import { assemble } from '@/../tests/helpers'
import Vuetify from 'vuetify'
import StatusButton from '@/components/StatusButton.vue'

describe('StatusButton.vue', () => {
  let vuetify

  const factory = assemble(StatusButton)
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
