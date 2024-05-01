import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponent from '?/stubs/BasicComponent.vue'
import BooleanComponent from '?/stubs/BooleanComponent.vue'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import { StateDefaults as ApplicationStateDefaults } from '@/store/modules/configuration/themes/sections/application'
import ThemeColorPicker, { Color } from '@/components/ThemeEditor/ThemeColorPicker.vue'

describe('components/ThemeEditor/ThemeColorPicker', () => {
  let vuetify
  let store

  const section = 'application'
  const colors: Color[] = [
    { label: 'Background', index: 'background' },
  ]

  const factory = assemble(ThemeColorPicker, { section, colors })
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
        configuration: {
          ...ConfigurationStateDefaults(),
          themes: {
            light: {
              application: ApplicationStateDefaults(),
            },
          },
        },
      },
      actions: stub_actions([
        'configuration/update',
      ]),
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
