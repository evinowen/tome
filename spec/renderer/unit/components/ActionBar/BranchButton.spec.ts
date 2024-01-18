import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import BranchButton from '@/components/ActionBar/BranchButton.vue'

describe('components/ActionBar/BranchButton', () => {
  let vuetify

  const factory = assemble(BranchButton)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          VBtn: BasicComponentStub,
          VIcon: BasicComponentStub,
        },
      },
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

  it('should show error icon if branch is not truthy', async () => {
    const wrapper = factory.wrap({ branch: '' })

    const error_icon = wrapper.findComponent({ ref: 'error-icon' })
    expect(error_icon.exists()).toBe(true)
  })

  it('should not show error icon if branch is truthy', async () => {
    const wrapper = factory.wrap({ branch: 'master' })

    const error_icon = wrapper.findComponent({ ref: 'error-icon' })
    expect(error_icon.exists()).toBe(false)
  })
})
