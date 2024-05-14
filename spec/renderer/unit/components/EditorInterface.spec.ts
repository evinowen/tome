import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import SplitPaneComponentStub from '?/stubs/SplitPaneComponentStub'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import { StateDefaults as RepositoryStateDefaults } from '@/store/modules/repository'
import { StateDefaults as FilesStateDefaults, File } from '@/store/modules/files'
import EditorInterface from '@/components/EditorInterface.vue'

describe('components/EditorInterface', () => {
  let vuetify
  let store

  const file_uuid = '1234-test-1234-test'

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        configuration: ConfigurationStateDefaults(),
        system: SystemStateDefaults(),
        repository: RepositoryStateDefaults(),
        files: {
          ...FilesStateDefaults(),
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
          plugins: [ vuetify, [ store, key ] ],
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
    const wrapper = factory.wrap()

    store.state.repository.path = '/path'
    store.state.files.active = file_uuid

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.selected).not.toEqual(File.Empty)
  })

  it('should clear selected file from files directory when active key is unset', async () => {
    const wrapper = factory.wrap()

    store.state.repository.path = '/path'
    store.state.files.active = file_uuid

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.selected).not.toEqual(File.Empty)

    store.state.files.active = ''

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.selected).toEqual(File.Empty)
  })
})
