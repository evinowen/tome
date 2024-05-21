import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import VTextField from '?/stubs/VTextField.vue'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import TextInput from '@/components/Input/TextInput.vue'

vi.mock('lodash', () => ({
  debounce: (callback) => {
    callback.cancel = vi.fn()
    callback.flush = vi.fn()
    return callback
  },
  cloneDeep: (value) => value,
}))

describe('components/Input/TextInput', () => {
  let vuetify

  const value = 'value'
  const label = 'label'

  const factory = assemble(TextInput, { value, label })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          VTextField,
          VBtn: BasicComponentStub,
          VIcon: BasicComponentStub,
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

  it('should emit "update" event when input emits model update', async () => {
    const wrapper = factory.wrap()

    const input_field = wrapper.findComponent({ ref: 'input-field' })
    expect(input_field.exists()).toBe(true)

    const value = 'John Doe'
    input_field.vm.$emit('update:model-value', value)

    expect(wrapper.emitted().update).toBeTruthy()
  })

  it('should invert obscured when display button emits click event', async () => {
    const wrapper = factory.wrap({ obscureable: true })

    const obscured = wrapper.vm.obscured

    const obscure_button = wrapper.findComponent({ ref: 'obscure-button' })
    expect(obscure_button.exists()).toBe(true)

    obscure_button.vm.$emit('click')

    expect(wrapper.vm.obscured).toBe(!obscured)
  })
})
