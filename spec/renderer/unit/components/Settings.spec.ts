import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import Settings from '@/components/Settings.vue'

describe('components/Settings', () => {
  let vuetify
  let store
  let store_dispatch

  const factory = assemble(Settings)
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          KeyfileInput: true,
          KeyfileOutput: true,
          SeaGame: true,
          ThemeColorPicker: true,
          ThemePreview: true,
          UtilityPage: BasicComponentStub,
          VBtn: true,
          VCol: BasicComponentStub,
          VContainer: BasicComponentStub,
          VDivider: BasicComponentStub,
          VLayout: BasicComponentStub,
          VRow: BasicComponentStub,
          VSwitch: true,
          VTextField: true,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        configuration_path: '/home/config.json',
        configuration: ConfigurationStateDefaults(),
        system: SystemStateDefaults(),
      },
      actions: stub_actions([
        'configuration/generate',
        'configuration/write',
        'system/settings',
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

  it('should dispatch system/settings with false when close is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(store_dispatch).toHaveBeenCalledWith('system/settings', false)
  })
})
