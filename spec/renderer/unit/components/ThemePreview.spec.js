import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import ThemePreview from '@/components/ThemePreview.vue'

describe('ThemePreview.vue', () => {
  let vuetify

  const factory = assemble(ThemePreview)
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
