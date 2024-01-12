import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { stub_actions } from '?/builders/store'
import { createStore } from 'vuex'
import { createVuetify } from 'vuetify'
import { State, key } from '@/store'
import { StateDefaults as ContextStateDefaults } from '@/store/modules/context'
import ContextMenuService from '@/components/ContextMenuService.vue'

describe('components/ContextMenuService', () => {
  let vuetify
  let store
  let store_dispatch

  const factory = assemble(ContextMenuService)
  .context(() => ({
    global: {
      plugins: [ vuetify, [store, key] ],
    }
  }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        context: ContextStateDefaults(),
      },
      actions: stub_actions([
        'context/close',
      ])
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

  it('should dispatch context/close with path when close is called', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(store_dispatch).toHaveBeenCalledWith('context/close')
  })

})
