import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponent from '?/stubs/BasicComponent.vue'
import BooleanComponent from '?/stubs/BooleanComponent.vue'
import { createVuetify } from 'vuetify'
import ThemePreview from '@/components/Settings/ThemePreview.vue'

describe('components/Settings/ThemePreview', () => {
  let vuetify

  const factory = assemble(ThemePreview)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          VCard: BasicComponent,
          VCardText: BasicComponent,
          VListItem: BasicComponent,
          VSwitch: BooleanComponent,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should set error value when error switch emits model update', async () => {
    const wrapper = factory.wrap()

    const error = wrapper.vm.error

    const error_switch = wrapper.findComponent({ ref: 'error-switch' })
    expect(error_switch.exists()).toBe(true)

    error_switch.vm.$emit('update:model-value', !error)
    expect(wrapper.vm.error).toBe(!error)

    error_switch.vm.$emit('update:model-value', error)
    expect(wrapper.vm.error).toBe(error)
  })
})
