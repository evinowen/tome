import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import PushBranch from '@/components/PushBranch.vue'

describe('components/PushBranch', () => {
  let vuetify

  const factory = assemble(PushBranch)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
      }
    }))

  beforeEach(() => {
    vuetify = createVuetify()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })
})
