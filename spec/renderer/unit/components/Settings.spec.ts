import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import { fetch_system_store } from '@/store/modules/system'
import Settings, { LocalityTitle, LocalitySubtitle, LocalityColor } from '@/components/Settings.vue'

describe('components/Settings', () => {
  let vuetify
  let pinia

  const factory = assemble(Settings)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          CredentialSelector: BasicComponentStub,
          KeyfileInput: true,
          KeyfileOutput: true,
          SeaGame: true,
          SignatureInput: BasicComponentStub,
          ThemeColorPicker: true,
          ThemePreview: true,
          UtilityPage: BasicComponentStub,
          VBtn: true,
          VCard: BasicComponentStub,
          VCardText: BasicComponentStub,
          VCardTitle: BasicComponentStub,
          VCol: BasicComponentStub,
          VContainer: BasicComponentStub,
          VDivider: BasicComponentStub,
          VIcon: BasicComponentStub,
          VLayout: BasicComponentStub,
          VRow: BasicComponentStub,
          VSwitch: true,
          VTab: BasicComponentStub,
          VTabs: BasicComponentStub,
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

  it('should set locality_title to blank when configuration target is blank', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = undefined

    const wrapper = factory.wrap()
    expect(wrapper.vm.locality_title).toEqual('')
  })

  it('should set locality_title to LocalityTitle.Global when configuration target is SettingsTarget.Global', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = SettingsTarget.Global

    const wrapper = factory.wrap()
    expect(wrapper.vm.locality_title).toEqual(LocalityTitle.Global)
  })

  it('should set locality_title to LocalityTitle.Local when configuration target is SettingsTarget.Global', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = SettingsTarget.Local

    const wrapper = factory.wrap()
    expect(wrapper.vm.locality_title).toEqual(LocalityTitle.Local)
  })

  it('should set locality_subtitle to blank when configuration target is blank', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = undefined

    const wrapper = factory.wrap()
    expect(wrapper.vm.locality_subtitle).toEqual('')
  })

  it('should set locality_subtitle to LocalitySubtitle.Global when configuration target is SettingsTarget.Global', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = SettingsTarget.Global

    const wrapper = factory.wrap()
    expect(wrapper.vm.locality_subtitle).toEqual(LocalitySubtitle.Global)
  })

  it('should set locality_subtitle to LocalitySubtitle.Local when configuration target is SettingsTarget.Global', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = SettingsTarget.Local

    const wrapper = factory.wrap()
    expect(wrapper.vm.locality_subtitle).toEqual(LocalitySubtitle.Local)
  })

  it('should set locality_color to blank when configuration target is blank', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = undefined

    const wrapper = factory.wrap()
    expect(wrapper.vm.locality_color).toEqual('')
  })

  it('should set locality_color to LocalityColor.Global when configuration target is SettingsTarget.Global', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = SettingsTarget.Global

    const wrapper = factory.wrap()
    expect(wrapper.vm.locality_color).toEqual(LocalityColor.Global)
  })

  it('should set locality_color to LocalityColor.Local when configuration target is SettingsTarget.Global', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = SettingsTarget.Local

    const wrapper = factory.wrap()
    expect(wrapper.vm.locality_color).toEqual(LocalityColor.Local)
  })
})
