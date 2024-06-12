import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import SettingsStateDefaults from '@/store/state/configuration/settings'
import NumberInput from '@/components/Settings/NumberInput.vue'

vi.mock('lodash', async (original) => {
  const { get } = await original<typeof import('lodash')>()
  return {
    throttle: (callback) => {
      callback.cancel = vi.fn()
      callback.flush = vi.fn()
      return callback
    },
    cloneDeep: (value) => value,
    get,
  }
})

describe('components/Settings/NumberInput', () => {
  let vuetify
  let pinia

  const label = 'name'
  const index = 'search_opacity'
  const slider = [ 0, 100, 5 ]
  const target = SettingsTarget.Global

  const factory = assemble(NumberInput, { label, index, slider, target })
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          SettingFrame: BasicComponentStub,
          TextInput: BasicComponentStub,
          VSlider: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })

    const configuration = fetch_configuration_store()
    configuration.global = {
      ...SettingsStateDefaults(),
      search_opacity: 100,
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()

    expect(wrapper).toBeDefined()
  })

  it('should emit "update" event when input emits model update', async () => {
    const configuration = fetch_configuration_store()

    const wrapper = factory.wrap()

    const input_field = wrapper.findComponent({ ref: 'input-field' })
    expect(input_field.exists()).toBe(true)

    const value = '1000'
    input_field.vm.$emit('update:model-value', value)

    expect(configuration.update).toHaveBeenCalledWith('global', index, Number(value))
  })

  it('should update slider_model when model value updates', async () => {
    const configuration = fetch_configuration_store()

    const wrapper = factory.wrap()
    expect(wrapper.vm.slider_model).toEqual(configuration.global.search_opacity)

    const value = 50
    configuration.global.search_opacity = value

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.slider_model).toEqual(value)
  })
})
