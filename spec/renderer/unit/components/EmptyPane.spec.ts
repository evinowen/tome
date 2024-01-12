import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'

import EmptyPane from '@/components/EmptyPane.vue'

describe('components/EmptyPane', () => {
  let vuetify

  beforeEach(() => {
    vuetify = createVuetify()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const factory = assemble(EmptyPane)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
      }
    }))

  it('is able to be mocked and prepared for testing', () => {
    const wrapper = factory.wrap()

    expect(wrapper).not.toBeUndefined()
  })
})
