import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import KeyfileOutput from '@/components/KeyfileOutput.vue'

describe('components/KeyfileOutput', () => {
  let vuetify
  let store
  let store_dispatch

  const factory = assemble(KeyfileOutput)
    .context(() => ({
      global: {
        plugins: [ vuetify, [store, key] ],
      }
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {},
      actions: stub_actions([
        'clipboard/text',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch clipboard/text with the component value when copy is called', async () => {
    const value = 'ssh-rsa 1245'
    const wrapper = factory.wrap({ value })

    await wrapper.vm.copy()

    expect(store_dispatch).toHaveBeenCalledWith('clipboard/text', value)
  })
})
