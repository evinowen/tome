import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { stub_actions } from '?/builders/store'
import { StateDefaults as ErrorStateDefaults } from '@/store/modules/error'
import ErrorBox from '@/components/ErrorBox.vue'

describe('components/ErrorBox', () => {
  let vuetify
  let store
  let store_dispatch

  const factory = assemble(ErrorBox)
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          VAvatar: BasicComponentStub,
          VBtn: BasicComponentStub,
          VCard: BasicComponentStub,
          VCardItem: BasicComponentStub,
          VCardTitle: BasicComponentStub,
          VCardText: BasicComponentStub,
          VCardActions: BasicComponentStub,
          VIcon: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        error: ErrorStateDefaults(),
      },
      actions: stub_actions([
        'error/help',
        'error/hide',
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

  it('should dispatch error/hide when confirm button is clicked', async () => {
    const wrapper = factory.wrap()

    const confirm_button = wrapper.findComponent({ ref: 'confirm-button' })
    expect(confirm_button.exists()).toBe(true)

    confirm_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledWith('error/hide')
  })

  it('should dispatch error/help when help button is clicked', async () => {
    const wrapper = factory.wrap()

    const help_button = wrapper.findComponent({ ref: 'help-button' })
    expect(help_button.exists()).toBe(true)

    help_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(store_dispatch).toHaveBeenCalledWith('error/help')
  })

  it('should set enlarge flag when overlay is clicked', async () => {
    vi.useFakeTimers()

    const wrapper = factory.wrap()

    const overlay = wrapper.find({ ref: 'overlay' })
    expect(overlay.exists()).toBe(true)

    overlay.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.enlarge).toEqual(true)
  })

  it('should set enlarge flag back to false 50ms after overlay is clicked', async () => {
    vi.useFakeTimers()

    const wrapper = factory.wrap()

    const overlay = wrapper.find({ ref: 'overlay' })
    expect(overlay.exists()).toBe(true)

    overlay.trigger('click')
    await wrapper.vm.$nextTick()

    vi.advanceTimersByTime(50)
    expect(wrapper.vm.enlarge).toEqual(false)
  })
})
