import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import KeyfileOutput from '@/components/KeyfileOutput.vue'
import { fetch_clipboard_store } from '@/store/modules/clipboard'

describe('components/KeyfileOutput', () => {
  let vuetify
  let pinia

  const factory = assemble(KeyfileOutput)
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
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

  it('should dispatch clipboard/text with the component value when copy is called', async () => {
    const clipboard = fetch_clipboard_store()

    const value = 'ssh-rsa 1245'
    const wrapper = factory.wrap({ value })

    await wrapper.vm.copy()

    expect(clipboard.text).toHaveBeenCalledWith(value)
  })
})
