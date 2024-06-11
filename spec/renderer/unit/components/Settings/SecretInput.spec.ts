import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import SecretInput from '@/components/Settings/SecretInput.vue'
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

describe('components/Settings/SecretInput', () => {
  let vuetify
  let pinia

  const label = 'name'
  const index = 'credentials.password'
  const prompt_index = 'credentials.password'

  const factory = assemble(SecretInput, { label, index, prompt_index })
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          SettingFrame: BasicComponentStub,
          TextInput: BasicComponentStub,
          VBtn: BasicComponentStub,
          VIcon: BasicComponentStub,
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

  it('should call configuration.update with new prompt value when prompt-button emits click event', async () => {
    const configuration = fetch_configuration_store()

    const wrapper = factory.wrap()
    const prompt_value = wrapper.vm.prompt

    const prompt_button = wrapper.findComponent({ ref: 'prompt-button' })
    expect(prompt_button.exists()).toBe(true)

    await prompt_button.trigger('click')

    expect(configuration.update).toHaveBeenCalledWith('global', prompt_index, !prompt_value)
  })
})
