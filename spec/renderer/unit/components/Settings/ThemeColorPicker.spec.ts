import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponent from '?/stubs/BasicComponent.vue'
import BooleanComponent from '?/stubs/BooleanComponent.vue'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import ThemeColorPicker from '@/components/Settings/ThemeColorPicker.vue'

describe('components/Settings/ThemeColorPicker', () => {
  let vuetify
  let store
  let store_dispatch

  const theme = 'light'
  const color = 'primary'

  const factory = assemble(ThemeColorPicker, { theme, color })
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
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

  it('should dispatch configuration/update with new enabled value when enabled switch emits model update', async () => {
    const wrapper = factory.wrap()

    const enabled_switch = wrapper.findComponent({ ref: 'enabled-switch' })
    expect(enabled_switch.exists()).toBe(true)

    const enabled = false
    enabled_switch.vm.$emit('update:model-value', enabled)

    const data = { [wrapper.vm.enabled_index]: enabled }
    expect(store_dispatch).toHaveBeenCalledWith('configuration/update', data)
  })

  it('should dispatch configuration/update with new color value when color picker emits model update', async () => {
    const wrapper = factory.wrap()

    const color_picker = wrapper.findComponent({ ref: 'color-input' })
    expect(color_picker.exists()).toBe(true)

    const color = '#000000'
    color_picker.vm.$emit('update:model-value', color)

    const data = { [wrapper.vm.color_index]: color }
    expect(store_dispatch).toHaveBeenCalledWith('configuration/update', data)
  })
})
