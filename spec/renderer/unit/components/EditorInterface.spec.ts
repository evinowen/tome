import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import SplitPaneComponentStub from '?/stubs/SplitPaneComponentStub'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import File from '@/objects/File'
import EditorInterface from '@/components/EditorInterface.vue'
import { fetch_files_store } from '@/store/modules/files'
import { fetch_repository_store } from '@/store/modules/repository'

describe('components/EditorInterface', () => {
  let vuetify
  let pinia

  const file_uuid = '1234-test-1234-test'

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        'files': {
          directory: {
            [file_uuid]: new File({
              name: 'Name',
              path: '/pa/th/to/fi/le.txt',
              extension: 'txt',
              children: [],
              directory: false,
            }),
          },
        },
      },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const factory = assemble(EditorInterface)
    .context(() => (
      {
        global: {
          plugins: [ vuetify, pinia ],
          stubs: {
            Explorer: true,
            FileEdit: true,
            FileView: true,
            SplitPane: SplitPaneComponentStub,
          },
        },
      }
    ))

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should assign selected file from files directory when active key is set', async () => {
    const files = fetch_files_store()
    const repository = fetch_repository_store()

    const wrapper = factory.wrap()

    repository.path = '/path'
    files.active = file_uuid

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.selected).not.toEqual(File.Empty)
  })

  it('should clear selected file from files directory when active key is unset', async () => {
    const files = fetch_files_store()
    const repository = fetch_repository_store()

    const wrapper = factory.wrap()

    repository.path = '/path'
    files.active = file_uuid

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.selected).not.toEqual(File.Empty)

    files.active = ''

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.selected).toEqual(File.Empty)
  })
})
