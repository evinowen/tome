import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { v4 as uuidv4 } from 'uuid'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import { StateDefaults as FilesStateDefaults, File } from '@/store/modules/files'
import Explorer from '@/components/Explorer.vue'

describe('components/ExplorerNode', () => {
  let vuetify
  let store

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        configuration: ConfigurationStateDefaults(),
        files: {
          ...FilesStateDefaults(),
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
      actions: stub_actions([
        'actions/execute',
        'actions/ghost',
        'files/blur',
        'files/delete',
        'files/edit',
        'files/ghost',
        'files/move',
        'files/open',
        'files/toggle',
        'files/select',
        'files/submit',
        'templates/execute',
        'templates/ghost',
      ]),
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
        plugins: [ vuetify, [ store, key ] ],
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
    const file = store.state.files.directory['/project']
    store.state.files.active = file.path

    const wrapper = factory.wrap()

    expect(wrapper.vm.active).toBe(file.uuid)
  })

  it('should set blank active file identifier for blank active store path', () => {
    store.state.files.active = ''

    const wrapper = factory.wrap()

    expect(wrapper.vm.active).toEqual('')
  })

  it('should set blank active file identifier for invalid active store path', () => {
    store.state.files.active = '/fake'

    const wrapper = factory.wrap()

    expect(wrapper.vm.active).toEqual('')
  })

  it('should set root file object for valid base path in store', () => {
    const wrapper = factory.wrap()

    expect(wrapper.vm.file).not.toEqual(File.Empty)
  })

  it('should set empty root file object for invalid base path in store', () => {
    store.state.files.base = '/fake'

    const wrapper = factory.wrap()

    expect(wrapper.vm.file).toEqual(File.Empty)
  })
})
