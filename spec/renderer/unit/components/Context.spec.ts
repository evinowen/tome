import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { Store, State, key } from '@/store'
import { stub_actions } from '?/builders/store'
import Context from '@/components/Context.vue'
import ContextMenu from '@/objects/context/ContextMenu'

vi.mock('@/objects/context/ContextMenu', () => ({
  default: class {},
}))

describe('components/Context', () => {
  let vuetify
  let store
  let store_dispatch

  const menu = new ContextMenu()

  let load: (store: Store<State>) => Promise<ContextMenu>

  const factory = assemble(Context).context(() => ({
    global: {
      plugins: [ vuetify, [ store, key ] ],
    },
  }))

  beforeEach(() => {
    load = async () => menu

    vuetify = createVuetify()

    store = createStore<State>({
      state: {},
      actions: stub_actions([
        'context/set',
        'context/open',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch context/set on call to context_commands method', async () => {
    const wrapper = factory.wrap({ load })
    wrapper.vm.context_commands()

    expect(store_dispatch).toHaveBeenCalled()
  })

  it('should dispatch context/open on call to context_menu method', async () => {
    const wrapper = factory.wrap({ load })
    wrapper.vm.context_menu(new MouseEvent('mousedown'))

    const position = { x: 0, y: 0 }
    expect(store_dispatch).toHaveBeenCalledWith('context/open', { position })
  })
})
