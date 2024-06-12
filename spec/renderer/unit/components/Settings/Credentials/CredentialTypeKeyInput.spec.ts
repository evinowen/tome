import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import CredentialTypeKeyInput from '@/components/Settings/Credentials/CredentialTypeKeyInput.vue'

describe('components/Settings/Credentials/CredentialTypeKeyInput', () => {
  let vuetify
  let pinia

  const value = 'value'
  const label = 'label'

  const factory = assemble(CredentialTypeKeyInput, { value, label })
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          KeyfileInput: BasicComponentStub,
          KeyfileOutput: BasicComponentStub,
          TextInput: BasicComponentStub,
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
})
