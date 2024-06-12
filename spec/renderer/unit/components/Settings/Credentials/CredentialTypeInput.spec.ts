import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import CredentialTypeInput from '@/components/Settings/Credentials/CredentialTypeInput.vue'

describe('components/Settings/Credentials/CredentialTypeInput', () => {
  let vuetify

  const value = 'value'
  const label = 'label'

  const factory = assemble(CredentialTypeInput, { value, label })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          SelectButtonInput: BasicComponentStub,
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
})
