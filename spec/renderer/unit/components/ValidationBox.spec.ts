import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ValidationStateDefaults } from '@/store/modules/validation'
import ValidationBox from '@/components/ValidationBox.vue'

describe('components/ValidationBox', () => {
  let vuetify
  let store

  const factory = assemble(ValidationBox)
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          VBtn: BasicComponentStub,
          VIcon: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        validation: ValidationStateDefaults(),
      },
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
    vi.useFakeTimers()

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
    expect(wrapper.vm.visible).toEqual(false)

    store.state.validation.visible = true
    store.state.validation.element = new HTMLElement()
    await wrapper.vm.$nextTick()

    vi.advanceTimersByTime(1000)

    expect(wrapper.vm.visible).toEqual(true)
  })

  it('should set timer when validation state visible becomes true', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    store.state.validation.visible = true
    store.state.validation.element = new HTMLElement()
    await wrapper.vm.$nextTick()

    wrapper.unmount()

    expect(wrapper.vm.ticker).toBeTruthy()
  })

  it('should clear timer when validation state visible becomes false', async () => {
    const mocked_clearInterval = vi.spyOn(global, 'clearInterval')

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    store.state.validation.visible = true
    store.state.validation.element = new HTMLElement()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.ticker).toBeTruthy()

    store.state.validation.visible = false
    await wrapper.vm.$nextTick()

    expect(mocked_clearInterval).toHaveBeenCalledWith(wrapper.vm.ticker)
  })

  it('should clear timer on component unmount', async () => {
    const mocked_clearInterval = vi.spyOn(global, 'clearInterval')

    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()

    store.state.validation.visible = true
    store.state.validation.element = new HTMLElement()
    await wrapper.vm.$nextTick()

    wrapper.unmount()

    expect(mocked_clearInterval).toHaveBeenCalledWith(wrapper.vm.ticker)
  })
})
