import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createTestingPinia } from '@pinia/testing'
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
  let pinia

  const factory = assemble(TextView, { content, type })
    .context(() => ({
      global: {
        plugins: [ pinia ],
      },
    }))

  beforeEach(() => {
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
})
