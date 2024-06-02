import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import ContextMenuService from '@/components/ContextMenuService.vue'
import { fetch_context_store } from '@/store/modules/context'

describe('components/ContextMenuService', () => {
  let vuetify
  let pinia

  const factory = assemble(ContextMenuService)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
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

  it('should dispatch context/close with path when close is called', async () => {
    const context = fetch_context_store()

    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(context.close).toHaveBeenCalledWith()
  })
})
