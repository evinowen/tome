import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import ThemeColorPicker from '@/components/ThemeColorPicker.vue'

describe('components/ThemeColorPicker', () => {
  let vuetify
  const enabled = true
  const value = '#000000'
  const color = 'Test'

  const factory = assemble(ThemeColorPicker, { enabled, value, color })
    .context(() => ({
      vuetify,
      stubs: { VSlider: true }
    }))

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
