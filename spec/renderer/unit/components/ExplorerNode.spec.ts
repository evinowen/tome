import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import ExplorerNode from '@/components/ExplorerNode.vue'
import BasicComponentStub from '?/stubs/BasicComponent.vue'
import ElementComponentStub from '?/stubs/ElementComponent.vue'
import File, { FileRelationshipType } from '@/objects/File'
import { format } from '@/modules/Titles'
import { fetch_files_store } from '@/store/modules/files'
import { fetch_configuration_store } from '@/store/modules/configuration'

vi.mock('@/modules/Titles', () => ({ format: vi.fn() }))

describe('components/ExplorerNode', () => {
  let vuetify
  let pinia

  const file_uuid = '1234-test-1234-test'
  let file

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        'files': {
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
        'repository': {
          name: 'example.repository',
        },
        'configuration': {
          draggable_objects: true,
          format_explorer_titles: false,
        },
      },
    })

    const files = fetch_files_store()
    file = files.directory[file_uuid]
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
        plugins: [ vuetify, pinia ],
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
    expect(format).toHaveBeenCalled()
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
    expect(format).toHaveBeenCalled()
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
    const files = fetch_files_store()

    files.editing = true

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
    files.editing = false
    await wrapper.vm.$nextTick()
    expect(context_element_focus).toHaveBeenCalled()
  })

  it('should dispatch files/select with file path when button emits click and file directory is false', async () => {
    const files = fetch_files_store()

    file.directory = false
    const wrapper = factory.wrap()

    const button = wrapper.findComponent({ ref: 'button' })
    button.trigger('click')

    expect(files.toggle).not.toHaveBeenCalledWith({ path: file.path })
    expect(files.select).toHaveBeenCalledWith({ path: file.path })
  })

  it('should not dispatch files/select with file path when button emits click and file directory is false while locked is true', async () => {
    const files = fetch_files_store()

    file.directory = false
    file.relationship = FileRelationshipType.Git
    const wrapper = factory.wrap()

    const button = wrapper.findComponent({ ref: 'button' })
    button.trigger('click')

    expect(files.toggle).not.toHaveBeenCalledWith({ path: file.path })
    expect(files.select).not.toHaveBeenCalledWith({ path: file.path })
  })

  it('should dispatch files/select with file path when context emits keydown for enter key and file directory is false', async () => {
    const files = fetch_files_store()

    file.directory = false
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: 'Enter' })

    expect(files.toggle).not.toHaveBeenCalledWith({ path: file.path })
    expect(files.select).toHaveBeenCalledWith({ path: file.path })
  })

  it('should not dispatch files/select with file path when context emits keydown for enter key and file directory is false if repeat is true', async () => {
    const files = fetch_files_store()

    file.directory = false
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: 'Enter', repeat: true })

    expect(files.toggle).not.toHaveBeenCalledWith({ path: file.path })
    expect(files.select).not.toHaveBeenCalledWith({ path: file.path })
  })

  it('should dispatch files/select with file path when context emits keydown for spacebar key and file directory is false', async () => {
    const files = fetch_files_store()

    file.directory = false
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: ' ' })

    expect(files.toggle).not.toHaveBeenCalledWith({ path: file.path })
    expect(files.select).toHaveBeenCalledWith({ path: file.path })
  })

  it('should not dispatch files/select with file path when context emits keydown for spacebar key and file directory is false if repeat is true', async () => {
    const files = fetch_files_store()

    file.directory = false
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: ' ', repeat: true })

    expect(files.toggle).not.toHaveBeenCalledWith({ path: file.path })
    expect(files.select).not.toHaveBeenCalledWith({ path: file.path })
  })

  it('should dispatch files/toggle with file path when button emits click and file directory is true', async () => {
    const files = fetch_files_store()

    file.directory = true
    const wrapper = factory.wrap()

    const button = wrapper.findComponent({ ref: 'button' })
    button.trigger('click')

    expect(files.toggle).toHaveBeenCalledWith({ path: file.path })
    expect(files.select).not.toHaveBeenCalledWith({ path: file.path })
  })

  it('should not dispatch files/toggle with file path when button emits click and file directory is true while locked is true', async () => {
    const files = fetch_files_store()

    file.directory = true
    file.relationship = FileRelationshipType.Git
    const wrapper = factory.wrap()

    const button = wrapper.findComponent({ ref: 'button' })
    button.trigger('click')

    expect(files.toggle).not.toHaveBeenCalledWith({ path: file.path })
    expect(files.select).not.toHaveBeenCalledWith({ path: file.path })
  })

  it('should dispatch files/toggle with file path when context emits keydown for enter key and file directory is true', async () => {
    const files = fetch_files_store()

    file.directory = true
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: 'Enter' })

    expect(files.toggle).toHaveBeenCalledWith({ path: file.path })
    expect(files.select).not.toHaveBeenCalledWith({ path: file.path })
  })

  it('should not dispatch files/toggle with file path when context emits keydown for enter key and file directory is true if repeat is true', async () => {
    const files = fetch_files_store()

    file.directory = true
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: 'Enter', repeat: true })

    expect(files.toggle).not.toHaveBeenCalledWith({ path: file.path })
    expect(files.select).not.toHaveBeenCalledWith({ path: file.path })
  })

  it('should dispatch files/toggle with file path when context emits keydown for spacebar key and file directory is true', async () => {
    const files = fetch_files_store()

    file.directory = true
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: ' ' })

    expect(files.toggle).toHaveBeenCalledWith({ path: file.path })
    expect(files.select).not.toHaveBeenCalledWith({ path: file.path })
  })

  it('should not dispatch files/select with file path when context emits keydown for spacebar key and file directory is true if repeat is true', async () => {
    const files = fetch_files_store()

    file.directory = true
    const wrapper = factory.wrap()

    const context = wrapper.findComponent({ ref: 'context' })
    context.trigger('keydown', { key: ' ', repeat: true })

    expect(files.toggle).not.toHaveBeenCalledWith({ path: file.path })
    expect(files.select).not.toHaveBeenCalledWith({ path: file.path })
  })

  it('should format the display name if title is set and instance is non-system', async () => {
    const configuration = fetch_configuration_store()
    // @ts-expect-error: Getter is read only
    configuration.active = { format_explorer_titles: true }

    vi.mocked(format).mockImplementation(() => 'Example File')

    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.display).not.toEqual(file.name)
    expect(wrapper.vm.display).toEqual('Example File')
  })

  it('should find a placeholder display name if title is set and format fails', async () => {
    const configuration = fetch_configuration_store()
    // @ts-expect-error: Getter is read only
    configuration.active = { format_explorer_titles: true }

    vi.mocked(format).mockImplementationOnce(() => {
      throw new Error('Error')
    })

    const wrapper = factory.wrap()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.display).toEqual(file.name)
  })

  it('should find a placeholder display name if title is set and format fails when file name is blank', async () => {
    const configuration = fetch_configuration_store()
    // @ts-expect-error: Getter is read only
    configuration.active = { format_explorer_titles: true }

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
