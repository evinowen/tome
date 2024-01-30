import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { stub_actions } from '?/builders/store'
import { createStore } from 'vuex'
import { createVuetify } from 'vuetify'
import { State, key } from '@/store'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import ConsoleButton from '@/components/ActionBar/ConsoleButton.vue'

describe('components/ActionBar/ConsoleButton', () => {
  let vuetify
  let store
  let store_dispatch

  const factory = assemble(ConsoleButton)
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
        system: SystemStateDefaults(),
      },
      actions: stub_actions([
        'library/select',
        'library/open',
        'library/close',
        'system/console',
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

  it('should dispatch "system/console" action when button is clicked', async () => {
    const wrapper = factory.wrap()

    const button = wrapper.findComponent({ ref: 'button' })
    expect(button.exists()).toBe(true)

    button.trigger('click')
    await wrapper.vm.$nextTick()

    const open = store.state.system.console

    expect(store_dispatch).toHaveBeenCalledWith('system/console', !open)
  })
})
