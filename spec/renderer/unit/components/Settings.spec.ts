import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import { fetch_system_store } from '@/store/modules/system'
import Settings from '@/components/Settings.vue'

describe('components/Settings', () => {
  let vuetify
  let pinia

  const factory = assemble(Settings)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
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

  it('should dispatch system/settings with false when close is called', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(system.page).toHaveBeenCalledWith({ settings: false })
  })
})
