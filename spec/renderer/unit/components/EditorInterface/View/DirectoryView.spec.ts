import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { File } from '@/store/modules/files'
import DirectoryView from '@/components/EditorInterface/View/DirectoryView.vue'

describe('components/EditorInterface/DirectoryView', () => {
  let vuetify
  const file = File.Empty

  const factory = assemble(DirectoryView, { file })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          EmptyPane: BasicComponentStub,
          FileIcon: true,
          VDivider: true,
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
