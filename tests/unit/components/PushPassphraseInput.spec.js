import { assemble } from '@/../tests/helpers'
import Vuetify from 'vuetify'
import PushPassphraseInput from '@/components/PushPassphraseInput.vue'

describe('PushConfirm.vue', () => {
  let vuetify

  const factory = assemble(PushPassphraseInput)
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
