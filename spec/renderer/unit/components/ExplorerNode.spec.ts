import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { stub_actions } from '?/builders/store'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as RepositoryStateDefaults } from '@/store/modules/repository'
import { StateDefaults as FilesStateDefaults, File } from '@/store/modules/files'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import ExplorerNode from '@/components/ExplorerNode.vue'
import BasicComponentStub from '?/stubs/BasicComponent.vue'
import ElementComponentStub from '?/stubs/ElementComponent.vue'
import { FileRelationshipType } from '@/store/modules/files/file'
import { format } from '@/modules/Titles'

vi.mock('@/modules/Titles', () => ({ format: vi.fn() }))

describe('components/ExplorerNode', () => {
  let vuetify
  let store
  let store_dispatch

  const file_uuid = '1234-test-1234-test'
  let file

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        files: {
          ...FilesStateDefaults(),
          directory: {
            [file_uuid]: new File({
              name: 'example.file.md',
              path: '/folder/example.file.md',
              extension: '.md',
              children: [],
              directory: false,
            }),
          },
        },
        repository: {
          ...RepositoryStateDefaults(),
          name: 'example.repository',
        },
        configuration: {
          ...ConfigurationStateDefaults(),
          draggable_objects: true,
          format_explorer_titles: false,
        },
      },
      actions: stub_actions([
        'files/toggle',
        'files/select',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')

    file = store.state.files.directory[file_uuid]
    file.relationship = FileRelationshipType.None
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const factory = assemble(ExplorerNode, {
    uuid: file_uuid,
    active: '',
  })
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: {
          ExplorerNodePickup: BasicComponentStub,
          Context: ElementComponentStub,
        },
      },
    }))

  it('should be flagged as system if file relationship equals FileRelationshipType.Root', async () => {
    file.relationship = FileRelationshipType.Root

    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should set draggable false if file relationship equals FileRelationshipType.Root', async () => {
    file.relationship = FileRelationshipType.Root

    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.draggable).toEqual(false)
  })

  it('should be flagged as system if file relationship equals FileRelationshipType.Git', async () => {
    file.relationship = FileRelationshipType.Git

    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should set draggable false if file relationship equals FileRelationshipType.Git', async () => {
    file.relationship = FileRelationshipType.Git

    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.draggable).toEqual(false)
  })

  it('should set locked true if the file relationship equals FileRelationshipType.Git', async () => {
    file.relationship = FileRelationshipType.Git

    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.locked).toEqual(true)
  })

  it('should be flagged as system if file relationship equals FileRelationshipType.Tome', async () => {
    file.relationship = FileRelationshipType.Tome

    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should set draggable false if file relationship equals FileRelationshipType.Tome', async () => {
    file.relationship = FileRelationshipType.Tome

    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.draggable).toEqual(false)
  })

  it('should set selected true if file File.uuid equals the active File.uuid', async () => {
    const wrapper = factory.wrap()

    await wrapper.vm.$nextTick()

    await wrapper.setProps({ active: file_uuid })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.selected).toEqual(true)
  })

  it('should set alert flag to false if the file File.ephemeral equals true', async () => {
    file.ephemeral = true
    const wrapper = factory.wrap()

    expect(wrapper.vm.system).toEqual(false)
    expect(wrapper.vm.alert).toEqual(false)
  })

  it('should set alert flag to false if the system flag equals true', async () => {
    file.relationship = FileRelationshipType.Root
    const wrapper = factory.wrap()

    expect(wrapper.vm.system).toEqual(true)
    expect(wrapper.vm.alert).toEqual(false)
  })

  it('should set alert flag to false if the file relationship equals FileRelationshipType.TomeFile', async () => {
    file.relationship = FileRelationshipType.TomeFile
    const wrapper = factory.wrap()

    expect(wrapper.vm.system).toEqual(false)
    expect(file.ephemeral).toEqual(false)
    expect(wrapper.vm.alert).toEqual(false)
  })

  it('should set alert flag to false if the file relationship equals FileRelationshipType.TomeFile', async () => {
    file.relationship = FileRelationshipType.None
    const wrapper = factory.wrap()

    expect(wrapper.vm.system).toEqual(false)
    expect(file.ephemeral).toEqual(false)
    expect(wrapper.vm.alert).toEqual(false)
  })

  it('should set alert flag to false if the file name can be formatted without error', async () => {
    file.relationship = FileRelationshipType.None
    const wrapper = factory.wrap()

    expect(wrapper.vm.system).toEqual(false)
    expect(file.ephemeral).toEqual(false)
    expect(format).toHaveBeenCalledOnce()
    expect(wrapper.vm.alert).toEqual(false)
  })

  it('should set alert flag to true if the file name cannot be formatted without error', async () => {
    vi.mocked(format).mockImplementation(() => {
      throw new Error('Error')
    })

    file.relationship = FileRelationshipType.None

    const wrapper = factory.wrap()

    expect(wrapper.vm.system).toEqual(false)
    expect(file.ephemeral).toEqual(false)
    expect(format).toHaveBeenCalledOnce()
    expect(wrapper.vm.alert).toEqual(true)
  })

  it('should call focus on the context element selected updates to true', async () => {
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    const context_element = context.find<HTMLElement>({ ref: 'element' })
    const context_element_focus = vi.spyOn(context_element.element, 'focus')

    expect(wrapper.vm.selected).toEqual(false)
    expect(context_element_focus).not.toHaveBeenCalled()

    await wrapper.setProps({ active: file_uuid })

    await wrapper.vm.$nextTick()

    expect(wrapper.vm.selected).toEqual(true)
    expect(context_element_focus).toHaveBeenCalled()
  })

  it('should call focus on the context element edit updates to false while selected is true', async () => {
    store.state.files.editing = true

    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    const context_element = context.find<HTMLElement>({ ref: 'element' })
    const context_element_focus = vi.spyOn(context_element.element, 'focus')

    expect(wrapper.vm.selected).toEqual(false)
    expect(wrapper.vm.edit).toEqual(false)
    expect(context_element_focus).not.toHaveBeenCalled()

    await wrapper.setProps({ active: file_uuid })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.selected).toEqual(true)
    expect(wrapper.vm.edit).toEqual(true)
    expect(context_element_focus).toHaveBeenCalled()

    context_element_focus.mockReset()
    store.state.files.editing = false
    await wrapper.vm.$nextTick()
    expect(context_element_focus).toHaveBeenCalled()
  })

  it('should dispatch files/select with file path when button emits click and file directory is false', async () => {
    file.directory = false
    const wrapper = factory.wrap()

    const button = wrapper.findComponent({ ref: 'button' })
    button.trigger('click')

    expect(store_dispatch).not.toHaveBeenCalledWith('files/toggle', { path: file.path })
    expect(store_dispatch).toHaveBeenCalledWith('files/select', { path: file.path })
  })

  it('should not dispatch files/select with file path when button emits click and file directory is false while locked is true', async () => {
    file.directory = false
    file.relationship = FileRelationshipType.Git
    const wrapper = factory.wrap()

    const button = wrapper.findComponent({ ref: 'button' })
    button.trigger('click')

    expect(store_dispatch).not.toHaveBeenCalledWith('files/toggle', { path: file.path })
    expect(store_dispatch).not.toHaveBeenCalledWith('files/select', { path: file.path })
  })

  it('should dispatch files/select with file path when context emits keydown for enter key and file directory is false', async () => {
    file.directory = false
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: 'Enter' })

    expect(store_dispatch).not.toHaveBeenCalledWith('files/toggle', { path: file.path })
    expect(store_dispatch).toHaveBeenCalledWith('files/select', { path: file.path })
  })

  it('should not dispatch files/select with file path when context emits keydown for enter key and file directory is false if repeat is true', async () => {
    file.directory = false
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: 'Enter', repeat: true })

    expect(store_dispatch).not.toHaveBeenCalledWith('files/toggle', { path: file.path })
    expect(store_dispatch).not.toHaveBeenCalledWith('files/select', { path: file.path })
  })

  it('should dispatch files/select with file path when context emits keydown for spacebar key and file directory is false', async () => {
    file.directory = false
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: ' ' })

    expect(store_dispatch).not.toHaveBeenCalledWith('files/toggle', { path: file.path })
    expect(store_dispatch).toHaveBeenCalledWith('files/select', { path: file.path })
  })

  it('should not dispatch files/select with file path when context emits keydown for spacebar key and file directory is false if repeat is true', async () => {
    file.directory = false
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: ' ', repeat: true })

    expect(store_dispatch).not.toHaveBeenCalledWith('files/toggle', { path: file.path })
    expect(store_dispatch).not.toHaveBeenCalledWith('files/select', { path: file.path })
  })

  it('should dispatch files/toggle with file path when button emits click and file directory is true', async () => {
    file.directory = true
    const wrapper = factory.wrap()

    const button = wrapper.findComponent({ ref: 'button' })
    button.trigger('click')

    expect(store_dispatch).toHaveBeenCalledWith('files/toggle', { path: file.path })
    expect(store_dispatch).not.toHaveBeenCalledWith('files/select', { path: file.path })
  })

  it('should not dispatch files/toggle with file path when button emits click and file directory is true while locked is true', async () => {
    file.directory = true
    file.relationship = FileRelationshipType.Git
    const wrapper = factory.wrap()

    const button = wrapper.findComponent({ ref: 'button' })
    button.trigger('click')

    expect(store_dispatch).not.toHaveBeenCalledWith('files/toggle', { path: file.path })
    expect(store_dispatch).not.toHaveBeenCalledWith('files/select', { path: file.path })
  })

  it('should dispatch files/toggle with file path when context emits keydown for enter key and file directory is true', async () => {
    file.directory = true
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: 'Enter' })

    expect(store_dispatch).toHaveBeenCalledWith('files/toggle', { path: file.path })
    expect(store_dispatch).not.toHaveBeenCalledWith('files/select', { path: file.path })
  })

  it('should not dispatch files/toggle with file path when context emits keydown for enter key and file directory is true if repeat is true', async () => {
    file.directory = true
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: 'Enter', repeat: true })

    expect(store_dispatch).not.toHaveBeenCalledWith('files/toggle', { path: file.path })
    expect(store_dispatch).not.toHaveBeenCalledWith('files/select', { path: file.path })
  })

  it('should dispatch files/toggle with file path when context emits keydown for spacebar key and file directory is true', async () => {
    file.directory = true
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: ' ' })

    expect(store_dispatch).toHaveBeenCalledWith('files/toggle', { path: file.path })
    expect(store_dispatch).not.toHaveBeenCalledWith('files/select', { path: file.path })
  })

  it('should not dispatch files/select with file path when context emits keydown for spacebar key and file directory is true if repeat is true', async () => {
    file.directory = true
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: ' ', repeat: true })

    expect(store_dispatch).not.toHaveBeenCalledWith('files/toggle', { path: file.path })
    expect(store_dispatch).not.toHaveBeenCalledWith('files/select', { path: file.path })
  })

  it('should format the display name if title is set and instance is non-system', async () => {
    store.state.configuration.format_explorer_titles = true
    vi.mocked(format).mockImplementation(() => 'Example File')

    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.display).not.toEqual(file.name)
    expect(wrapper.vm.display).toEqual('Example File')
  })

  it('should find a placeholder display name if title is set and format fails', async () => {
    store.state.configuration.format_explorer_titles = true
    vi.mocked(format).mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.display).toEqual(file.name)
  })

  it('should find a placeholder display name if title is set and format fails when file name is blank', async () => {
    store.state.configuration.format_explorer_titles = true
    file.name = ''
    vi.mocked(format).mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.display).not.toEqual(file.name)
    expect(wrapper.vm.display).toEqual(' - ')
  })
})
