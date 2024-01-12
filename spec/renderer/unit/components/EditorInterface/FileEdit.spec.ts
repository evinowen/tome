import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { File } from '@/store/modules/files'
import FileEdit from '@/components/EditorInterface/FileEdit.vue'

describe('components/EditorInterface/FileEdit', () => {
  let vuetify
  let file = File.Empty

  const factory = assemble(FileEdit, { file })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          DirectoryView: BasicComponentStub,
          ImageView: BasicComponentStub,
          TextEdit: BasicComponentStub,
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
