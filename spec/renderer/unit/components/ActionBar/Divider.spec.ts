import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import Divider from '@/components/ActionBar/Divider.vue'

describe('components/ActionBar/Divider', () => {
  let vuetify

  const factory = assemble(Divider)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          VDivider: BasicComponentStub,
        }
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
