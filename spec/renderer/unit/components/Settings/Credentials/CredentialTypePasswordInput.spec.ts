import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import CredentialTypePasswordInput from '@/components/Settings/Credentials/CredentialTypePasswordInput.vue'

describe('components/Settings/Credentials/CredentialTypePasswordInput', () => {
  let vuetify

  const value = 'value'
  const label = 'label'

  const factory = assemble(CredentialTypePasswordInput, { value, label })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          TextInput: BasicComponentStub,
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
