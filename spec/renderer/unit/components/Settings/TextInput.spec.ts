import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import TextInput from '@/components/Settings/TextInput.vue'
import { fetch_configuration_store } from '@/store/modules/configuration'

vi.mock('lodash', () => ({
  throttle: (callback) => {
    callback.cancel = vi.fn()
    callback.flush = vi.fn()
    return callback
  },
  cloneDeep: (value) => value,
  get: vi.fn(),
}))

describe('components/Settings/TextInput', () => {
  let vuetify
  let pinia

  const label = 'name'
  const index = 'signature.name'

  const factory = assemble(TextInput, { label, index })
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          SettingFrame: BasicComponentStub,
          TextInput: BasicComponentStub,
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

  it('should call configuration.update with new value when input emits model update', async () => {
    const configuration = fetch_configuration_store()

    const wrapper = factory.wrap()

    const input_field = wrapper.findComponent({ ref: 'input-field' })
    expect(input_field.exists()).toBe(true)

    const value = 'John Doe'
    input_field.vm.$emit('update', value)

    expect(configuration.update).toHaveBeenCalledWith('global', index, value)
  })
})
