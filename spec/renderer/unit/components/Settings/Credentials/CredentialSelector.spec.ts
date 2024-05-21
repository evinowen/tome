import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import CredentialSelector from '@/components/Settings/Credentials/CredentialSelector.vue'

describe('components/Settings/Credentials/CredentialSelector', () => {
  let vuetify
  let store

  const value = 'value'
  const label = 'label'

  const factory = assemble(CredentialSelector, { value, label })
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          CredentialTypeInput: BasicComponentStub,
          CredentialTypePasswordInput: BasicComponentStub,
          CredentialTypeKeyInput: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        configuration: ConfigurationStateDefaults(),
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
