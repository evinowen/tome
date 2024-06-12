import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import EditSwitch from '@/components/ActionBar/EditSwitch.vue'

describe('components/ActionBar/EditSwitch', () => {
  let vuetify

  const factory = assemble(EditSwitch)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          ToggleSwitch: BasicComponentStub,
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

  it('should emit "update" event when switch emits "update" event', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    const toggle_switch = wrapper.findComponent({ ref: 'switch' })
    expect(toggle_switch.exists()).toBe(true)

    toggle_switch.vm.$emit('update', true)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().update).toBeTruthy()
  })
})
