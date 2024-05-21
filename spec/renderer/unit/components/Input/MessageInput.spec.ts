import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import MessageInput from '@/components/Input/MessageInput.vue'

vi.mock('lodash', () => ({
  debounce: (callback) => {
    callback.cancel = vi.fn()
    callback.flush = vi.fn()
    return callback
  },
  cloneDeep: (value) => value,
}))

describe('components/Input/MessageInput', () => {
  let vuetify

  const value = 'value'
  const label = 'label'

  const factory = assemble(MessageInput, { value, label })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          VDivider: BasicComponentStub,
          VTextarea: BasicComponentStub,
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
})
