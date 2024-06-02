import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import Context from '@/components/Context.vue'
import ContextMenu from '@/objects/context/ContextMenu'
import { fetch_context_store } from '@/store/modules/context'

vi.mock('@/objects/context/ContextMenu', () => ({
  default: class {},
}))

describe('components/Context', () => {
  let vuetify
  let pinia

  const menu = new ContextMenu()

  let load: () => Promise<ContextMenu>

  const factory = assemble(Context).context(() => ({
    global: {
      plugins: [ vuetify, pinia ],
    },
  }))

  beforeEach(() => {
    load = async () => menu

    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {},
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should dispatch context/set on call to context_commands method', async () => {
    const context = fetch_context_store()

    const wrapper = factory.wrap({ load })
    wrapper.vm.context_commands()

    expect(context.set).toHaveBeenCalledWith(load)
  })

  it('should dispatch context/open on call to context_menu method', async () => {
    const context = fetch_context_store()

    const wrapper = factory.wrap({ load })
    wrapper.vm.context_menu(new MouseEvent('mousedown'))

    const position = { x: 0, y: 0 }
    expect(context.open).toHaveBeenCalledWith({ position })
  })
})
