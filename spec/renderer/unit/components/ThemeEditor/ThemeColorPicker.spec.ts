import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponent from '?/stubs/BasicComponent.vue'
import BooleanComponent from '?/stubs/BooleanComponent.vue'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import ThemeColorPicker, { Color } from '@/components/ThemeEditor/ThemeColorPicker.vue'

describe('components/ThemeEditor/ThemeColorPicker', () => {
  let vuetify
  let pinia

  const section = 'application'
  const colors: Color[] = [
    { label: 'Background', index: 'background' },
  ]

  const factory = assemble(ThemeColorPicker, { section, colors })
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          VCard: BasicComponent,
          VCardTitle: BasicComponent,
          VColorPicker: BasicComponent,
          VSwitch: BooleanComponent,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })
})
