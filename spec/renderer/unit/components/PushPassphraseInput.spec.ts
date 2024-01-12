import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import PushPassphraseInput from '@/components/PushPassphraseInput.vue'

describe('components/PushPassphraseInput', () => {
  let vuetify

  const factory = assemble(PushPassphraseInput)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
      }
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

  it('should emit "input" event with empty string value when clear button emits click event', async () => {
    const wrapper = factory.wrap({ value: 'value' })

    const clear_button = wrapper.findComponent({ref: 'clear'})
    expect(clear_button.exists()).toBe(true)

    clear_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().input).toBeTruthy()
    expect(wrapper.emitted().input[0]).toEqual([''])
  })

  it('should emit "input" event with stored string value when load button emits click event', async () => {
    const stored = 'password'
    const wrapper = factory.wrap({ storable: true, stored })

    const load_button = wrapper.findComponent({ref: 'load'})
    expect(load_button.exists()).toBe(true)

    load_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().input).toBeTruthy()
    expect(wrapper.emitted().input[0]).toEqual([stored])
  })

  it('should invert obscured value when display button emits click event', async () => {
    const wrapper = factory.wrap()

    const obscured = wrapper.vm.obscured

    const display_button = wrapper.findComponent({ref: 'display'})
    expect(display_button.exists()).toBe(true)

    display_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.obscured).toEqual(!obscured)
  })
})
