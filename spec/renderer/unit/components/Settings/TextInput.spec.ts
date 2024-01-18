import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { stub_actions } from '?/builders/store'
import VTextField from '?/stubs/VTextField.vue'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import TextInput from '@/components/Settings/TextInput.vue'

describe('components/Settings/TextInput', () => {
  let vuetify
  let store
  let store_dispatch

  const label = 'name'
  const index = 'name'

  const factory = assemble(TextInput, { label, index })
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          VTextField,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        configuration: ConfigurationStateDefaults(),
      },
      actions: stub_actions([
        'configuration/update',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()

    expect(wrapper).toBeDefined()
  })

  it('should dispatch configuration/update with new value when input emits model update', async () => {
    const wrapper = factory.wrap()

    const input_field = wrapper.findComponent({ ref: 'input' })
    expect(input_field.exists()).toBe(true)

    const value = 'John Doe'
    input_field.vm.$emit('update:model-value', value)

    const data = { [index]: value }
    expect(store_dispatch).toHaveBeenCalledWith('configuration/update', data)
  })

  it('should invert obscured when display button emits click event', async () => {
    const wrapper = factory.wrap()

    const obscured = wrapper.vm.obscured

    const input_field = wrapper.findComponent({ ref: 'input' })
    expect(input_field.exists()).toBe(true)

    const value = 'John Doe'
    input_field.vm.$emit('click:append', value)

    expect(wrapper.vm.obscured).toBe(!obscured)
  })
})
