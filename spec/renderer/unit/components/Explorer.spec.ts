import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import { v4 as uuidv4 } from 'uuid'
import { createTestingPinia } from '@pinia/testing'
import File from '@/objects/File'
import Explorer from '@/components/Explorer.vue'
import { fetch_files_store } from '@/store/modules/files'

describe('components/ExplorerNode', () => {
  let vuetify
  let pinia

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        'files': {
          base: '/project',
          path: '/project',
          active: '',
          content: '',
          directory: {
            '/project': new File({
              path: '/project',
            }),
          },
        },
      },
    })

    children.length = 0
    children.push(
      {
        uuid: uuidv4(),
        name: 'first',
        path: '/project/first',
        directory: true,
        children: [],
        templates: [],
        actions: [],
        expanded: false,
      },
      {
        uuid: uuidv4(),
        name: 'ephemeral.md',
        path: '/project/ephemeral.md',
        directory: false,
        children: [],
        templates: [],
        actions: [],
        expanded: false,
        ephemeral: true,
      },
      {
        uuid: uuidv4(),
        name: 'third',
        path: '/project/third',
        directory: true,
        children: [],
        templates: [],
        actions: [],
        expanded: false,
      },
      {
        uuid: uuidv4(),
        name: 'file.md',
        path: '/project/file.md',
        directory: false,
        children: [],
        templates: [],
        actions: [],
        expanded: false,
      },
      {
        uuid: uuidv4(),
        name: 'second',
        path: '/project/second',
        directory: true,
        children: [],
        templates: [],
        actions: [],
        expanded: false,
      },
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const children = []

  const factory = assemble(Explorer, { enabled: true })
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          VIcon: true,
          VContainer: BasicComponentStub,
        },
      },
    }))

  it('is able to be mocked and prepared for testing', () => {
    const wrapper = factory.wrap()
    expect(wrapper).not.toBeUndefined()
  })

  it('should set active file identifier from active store path', () => {
    const files = fetch_files_store()

    const file = files.directory['/project']
    files.active = file.path

    const wrapper = factory.wrap()

    expect(wrapper.vm.active).toBe(file.uuid)
  })

  it('should set blank active file identifier for blank active store path', () => {
    const files = fetch_files_store()

    files.active = ''

    const wrapper = factory.wrap()

    expect(wrapper.vm.active).toEqual('')
  })

  it('should set blank active file identifier for invalid active store path', () => {
    const files = fetch_files_store()

    files.active = '/fake'

    const wrapper = factory.wrap()

    expect(wrapper.vm.active).toEqual('')
  })

  it('should set root file object for valid base path in store', () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.file).not.toEqual(File.Empty)
  })

  it('should set empty root file object for invalid base path in store', () => {
    const files = fetch_files_store()

    files.base = '/fake'

    const wrapper = factory.wrap()

    expect(wrapper.vm.file).toEqual(File.Empty)
  })
})
