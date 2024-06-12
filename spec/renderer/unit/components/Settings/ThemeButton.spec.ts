import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import { fetch_system_store } from '@/store/modules/system'
import ThemeButton from '@/components/Settings/ThemeButton.vue'

vi.mock('lodash', () => ({
  throttle: (callback) => {
    callback.cancel = vi.fn()
    callback.flush = vi.fn()
    return callback
  },
  cloneDeep: (value) => value,
  get: vi.fn(),
}))

describe('components/Settings/ThemeButton', () => {
  let vuetify
  let pinia

  const factory = assemble(ThemeButton)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          SettingFrame: BasicComponentStub,
          TextInput: BasicComponentStub,
          VBtn: BasicComponentStub,
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

  it('should call system.page to enable theme_editor flag upon call to click', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.click()

    expect(system.page).toHaveBeenCalledWith({ theme_editor: true })
  })

  it('should call system.page to enable theme_editor flag when input button emits "click" event', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    const input_button = wrapper.findComponent({ ref: 'input-button' })
    expect(input_button.exists()).toBe(true)

    await input_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(system.page).toHaveBeenCalledWith({ theme_editor: true })
  })

  it('should disable local flag when configuration.target equals SettingsTarget.Global', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = SettingsTarget.Global

    const wrapper = factory.wrap()

    expect(wrapper.vm.local).toEqual(false)
  })

  it('should enable local flag when configuration.target equals SettingsTarget.Local', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = SettingsTarget.Local

    const wrapper = factory.wrap()

    expect(wrapper.vm.local).toEqual(true)
  })

  it('should disable disabled flag when local flag is false', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = SettingsTarget.Global

    const wrapper = factory.wrap()

    expect(wrapper.vm.disabled).toEqual(false)
  })

  it('should enable disabled flag when local flag is true and localized flag is false', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = SettingsTarget.Local
    configuration.localized.themes = false

    const wrapper = factory.wrap()

    expect(wrapper.vm.disabled).toEqual(true)
  })

  it('should disable disabled flag when local flag is true and localized flag is true', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = SettingsTarget.Local
    configuration.localized.themes = true

    const wrapper = factory.wrap()

    expect(wrapper.vm.disabled).toEqual(false)
  })
})
