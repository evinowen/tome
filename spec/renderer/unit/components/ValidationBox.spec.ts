import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createTestingPinia } from '@pinia/testing'
import ValidationBox from '@/components/ValidationBox.vue'
import { fetch_validation_store } from '@/store/modules/validation'

describe('components/ValidationBox', () => {
  let vuetify
  let pinia

  const factory = assemble(ValidationBox)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          VBtn: BasicComponentStub,
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

  it('should set internal visible flag timer ticks', async () => {
    const validation = fetch_validation_store()

    vi.useFakeTimers()

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
    expect(wrapper.vm.visible).toEqual(false)

    validation.visible = true
    validation.element = new HTMLElement()
    await wrapper.vm.$nextTick()

    vi.advanceTimersByTime(1000)

    expect(wrapper.vm.visible).toEqual(true)
  })

  it('should set timer when validation state visible becomes true', async () => {
    const validation = fetch_validation_store()

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    validation.visible = true
    validation.element = new HTMLElement()
    await wrapper.vm.$nextTick()

    wrapper.unmount()

    expect(wrapper.vm.ticker).toBeTruthy()
  })

  it('should clear timer when validation state visible becomes false', async () => {
    const validation = fetch_validation_store()

    const mocked_clearInterval = vi.spyOn(global, 'clearInterval')

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    validation.visible = true
    validation.element = new HTMLElement()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.ticker).toBeTruthy()

    validation.visible = false
    await wrapper.vm.$nextTick()

    expect(mocked_clearInterval).toHaveBeenCalledWith(wrapper.vm.ticker)
  })

  it('should clear timer on component unmount', async () => {
    const validation = fetch_validation_store()

    const mocked_clearInterval = vi.spyOn(global, 'clearInterval')

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    validation.visible = true
    validation.element = new HTMLElement()
    await wrapper.vm.$nextTick()

    wrapper.unmount()

    expect(mocked_clearInterval).toHaveBeenCalledWith(wrapper.vm.ticker)
  })
})
