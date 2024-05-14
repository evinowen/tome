import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import { StateDefaults as RenderedStateDefaults } from '@/store/modules/configuration/themes/sections/rendered'
import TextView from '@/components/RenderedViewport.vue'

vi.mock('marked', () => ({
  marked: {
    parse: vi.fn(),
    use: vi.fn(),
  },
}))

describe('components/RenderedViewport', () => {
  const type = 'markdown'
  const content = `
    # Header
    Example content.
  `
  let store

  const factory = assemble(TextView, { content, type })
    .context(() => ({
      global: {
        plugins: [ [ store, key ] ],
      },
    }))

  beforeEach(() => {
    store = createStore<State>({
      state: {
        configuration: {
          ...ConfigurationStateDefaults(),
          themes: {
            dark: {},
            light: {
              rendered: RenderedStateDefaults(),
            },
          },
        },
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
})
