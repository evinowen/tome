import { describe, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import ToggleSwitch from '@/components/Input/ToggleSwitch.vue'

vi.mock('lodash', () => ({
  throttle: (callback) => {
    callback.cancel = vi.fn()
    callback.flush = vi.fn()
    return callback
  },
  cloneDeep: (value) => value,
  get: vi.fn(),
}))

describe('components/Settings/ToggleSwitch', () => {
  const factory = assemble(ToggleSwitch, { inset: true })
    .context(() => ({
      global: {
        plugins: [ ],
      },
    }))

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()

    expect(wrapper).toBeDefined()
  })

  it('should emit update event upon call to click method', async () => {
    const wrapper = factory.wrap()
    await wrapper.vm.click()

    expect(wrapper.emitted().update).toBeTruthy()
  })

  it('should emit update event with inverted value upon call to click method', async () => {
    const wrapper = factory.wrap()

    const value = wrapper.vm.value
    await wrapper.vm.click()

    expect(wrapper.emitted().update[0]).toEqual([ !value ])
  })
})
