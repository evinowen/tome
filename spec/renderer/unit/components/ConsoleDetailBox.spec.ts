import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { stub_actions } from '?/builders/store'
import { StateDefaults as ErrorStateDefaults } from '@/store/modules/error'
import ConsoleDetailBox from '@/components/ConsoleDetailBox.vue'

describe('components/ConsoleDetailBox', () => {
  let vuetify
  let store
  let store_dispatch

  const factory = assemble(ConsoleDetailBox, { message: 'Example Message', level: 'trace' })
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          OverlayBox: BasicComponentStub,
          VAvatar: BasicComponentStub,
          VBtn: BasicComponentStub,
          VCard: BasicComponentStub,
          VCardActions: BasicComponentStub,
          VCardItem: BasicComponentStub,
          VCardText: BasicComponentStub,
          VCardTitle: BasicComponentStub,
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

  it('should emit "done" event when done button is clicked', async () => {
    const wrapper = factory.wrap()

    const done_button = wrapper.findComponent({ ref: 'done-button' })
    expect(done_button.exists()).toBe(true)

    done_button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().done).toBeTruthy()
  })

  it('should set color to "background" when level is "trace"', async () => {
    const wrapper = factory.wrap({ level: 'trace' })
    expect(wrapper.vm.color).toBe('background')
  })

  it('should set color to "success" when level is "debug"', async () => {
    const wrapper = factory.wrap({ level: 'debug' })
    expect(wrapper.vm.color).toBe('success')
  })

  it('should set color to "info" when level is "info"', async () => {
    const wrapper = factory.wrap({ level: 'info' })
    expect(wrapper.vm.color).toBe('info')
  })

  it('should set color to "warning" when level is "warn"', async () => {
    const wrapper = factory.wrap({ level: 'warn' })
    expect(wrapper.vm.color).toBe('warning')
  })

  it('should set color to "error" when level is "error"', async () => {
    const wrapper = factory.wrap({ level: 'error' })
    expect(wrapper.vm.color).toBe('error')
  })

  it('should set color to "error" when level is "fatal"', async () => {
    const wrapper = factory.wrap({ level: 'fatal' })
    expect(wrapper.vm.color).toBe('error')
  })

  it('should set color to blank when level is unrecognized value', async () => {
    const wrapper = factory.wrap({ level: 'unknown' })
    expect(wrapper.vm.color).toBe('')
  })

  it('should set icon to "mdi-dots-horizontal" when level is "trace"', async () => {
    const wrapper = factory.wrap({ level: 'trace' })
    expect(wrapper.vm.icon).toBe('mdi-dots-horizontal')
  })

  it('should set icon to "mdi-eye" when level is "debug"', async () => {
    const wrapper = factory.wrap({ level: 'debug' })
    expect(wrapper.vm.icon).toBe('mdi-eye')
  })

  it('should set icon to "mdi-information-slab-symbol" when level is "info"', async () => {
    const wrapper = factory.wrap({ level: 'info' })
    expect(wrapper.vm.icon).toBe('mdi-information-slab-symbol')
  })

  it('should set icon to "mdi-bell" when level is "warn"', async () => {
    const wrapper = factory.wrap({ level: 'warn' })
    expect(wrapper.vm.icon).toBe('mdi-bell')
  })

  it('should set icon to "mdi-close-thick" when level is "error"', async () => {
    const wrapper = factory.wrap({ level: 'error' })
    expect(wrapper.vm.icon).toBe('mdi-close-thick')
  })

  it('should set icon to "mdi-close-thick" when level is "fatal"', async () => {
    const wrapper = factory.wrap({ level: 'fatal' })
    expect(wrapper.vm.icon).toBe('mdi-close-thick')
  })

  it('should set icon to blank when level is unrecognized value', async () => {
    const wrapper = factory.wrap({ level: 'unknown' })
    expect(wrapper.vm.icon).toBe('')
  })
})
