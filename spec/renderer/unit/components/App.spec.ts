import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import App from '@/components/App.vue'

describe('components/App', () => {
  let vuetify
  let pinia

  const factory = assemble(App)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          VApp: true,
          VMain: true,
          SystemBar: true,
          Settings: true,
          Branch: true,
          Patch: true,
          Commit: true,
          Push: true,
          Console: true,
          EditorInterface: true,
          EmptyPane: true,
          ActionBar: true,
          ContextMenuService: true,
          SearchService: true,
          ShortcutService: true,
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

  it('should reset the scroll for element included as event for scroll method', async () => {
    const event = {
      target: { scrollTop: 100 },
    }

    expect(event.target.scrollTop).not.toBe(0)

    const wrapper = factory.wrap()

    wrapper.vm.scroll(event)

    expect(event.target.scrollTop).toBe(0)
  })
})
