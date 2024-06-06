import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import SettingFrame from '@/components/Settings/SettingFrame.vue'

vi.mock('lodash', () => ({
  throttle: (callback) => {
    callback.cancel = vi.fn()
    callback.flush = vi.fn()
    return callback
  },
  cloneDeep: (value) => value,
  get: vi.fn(),
}))

describe('components/Settings/SettingFrame', () => {
  let vuetify
  let pinia

  const label = 'name'
  const index = 'signature.name'

  const factory = assemble(SettingFrame, { label, index })
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
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

  it('should call configuration.localize with disabled flag when checkbox input emits click', async () => {
    const configuration = fetch_configuration_store()
    configuration.target = SettingsTarget.Local

    const wrapper = factory.wrap()
    const disabled = wrapper.vm.disabled

    const checkbox_input = wrapper.find({ ref: 'checkbox-input' })
    expect(checkbox_input.exists()).toBe(true)
    checkbox_input.trigger('click')

    expect(configuration.localize).toHaveBeenCalledWith(index, disabled)
  })
})
