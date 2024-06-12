import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import File, { FileRelationshipType } from '@/objects/File'
import FileButtonIcon from '@/components/FileButtonIcon.vue'

describe('components/FileButtonIcon', () => {
  let vuetify
  let file: File

  const factory = assemble(FileButtonIcon)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()
    file = new File({
      name: 'Name',
      path: '/pa/th/to/fi/le.txt',
      extension: 'txt',
      children: [],
      directory: false,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap({ file })

    expect(wrapper).toBeDefined()
  })

  it('should enable system flag when relationship is FileRelationshipType.Git', async () => {
    file.relationship = FileRelationshipType.Git

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should enable system flag when relationship if FileRelationshipType.Tome', async () => {
    file.relationship = FileRelationshipType.Tome

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should enable system flag when relationship is FileRelationshipType.TomeFeatureTemplates', async () => {
    file.relationship = FileRelationshipType.TomeFeatureTemplates

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should enable system flag when relationship is FileRelationshipType.TomeFeatureActions', async () => {
    file.relationship = FileRelationshipType.TomeFeatureActions

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should enable system flag when relationship is FileRelationshipType.TomeTemplate', async () => {
    file.relationship = FileRelationshipType.TomeTemplate

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should enable system flag when relationship is FileRelationshipType.TomeAction', async () => {
    file.relationship = FileRelationshipType.TomeAction

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should set icon as closed directory when flagged as directory and relationship does not have value "root"', async () => {
    file.directory = true

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.icon).toEqual('mdi-folder')
  })

  it('should set icon as open directory when flagged as expanded directory and relationship does not have value "root"', async () => {
    file.directory = true
    file.expanded = true

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.icon).toEqual('mdi-folder-open')
  })

  it('should set icon as closed book when flagged as directory and relationship has value "root"', async () => {
    file.directory = true
    file.relationship = FileRelationshipType.Root

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.icon).toEqual('mdi-book')
  })

  it('should set icon as open book when flagged as expanded directory and relationship has value "root"', async () => {
    file.directory = true
    file.expanded = true
    file.relationship = FileRelationshipType.Root

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.icon).toEqual('mdi-book-open-page-variant')
  })

  it('should set icon as image when flagged as an image', async () => {
    file.image = true

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.icon).toEqual('mdi-image')
  })

  it('should clear badge when relationship has value "root"', async () => {
    file.relationship = FileRelationshipType.Root

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.badge).toEqual('')
  })

  it('should set badge to lock when relationship has value "git"', async () => {
    file.relationship = FileRelationshipType.Git

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.badge).toEqual('mdi-lock')
  })

  it('should set badge to closed eye when relationship has value "tome"', async () => {
    file.relationship = FileRelationshipType.Tome

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.badge).toEqual('mdi-minus-circle')
  })

  it('should set badge to open eye when expanded and relationship has value "tome"', async () => {
    file.relationship = FileRelationshipType.Tome
    file.expanded = true

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.badge).toEqual('mdi-eye-circle')
  })

  it('should set badge to alert when flagged as alert', async () => {
    const wrapper = factory.wrap({ file, alert: true })

    expect(wrapper.vm.badge).toEqual('mdi-alert-circle')
  })

  it('should set badge to cog when relationship has value "tome-feature-actions"', async () => {
    file.relationship = FileRelationshipType.TomeFeatureActions

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.badge).toEqual('mdi-cog')
  })

  it('should set badge to cog when relationship has value "tome-feature-templates"', async () => {
    file.relationship = FileRelationshipType.TomeFeatureTemplates

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.badge).toEqual('mdi-cog')
  })

  it('should set badge to play arrow when relationship has value "tome-action"', async () => {
    file.relationship = FileRelationshipType.TomeAction

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.badge).toEqual('mdi-play-circle')
  })

  it('should set badge to lightning when relationship has value "tome-template"', async () => {
    file.relationship = FileRelationshipType.TomeTemplate

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.badge).toEqual('mdi-lightning-bolt-circle')
  })

  it('should set badge to cog when relationship has value "tome-feature-actions"', async () => {
    file.relationship = FileRelationshipType.TomeFeatureActions

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.badge).toEqual('mdi-cog')
  })

  it('should set badge to markdown when relationship has value "tome-file" and markdown extension', async () => {
    file.relationship = FileRelationshipType.TomeFile
    file.extension = '.md'

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.badge).toEqual('mdi-arrow-down-bold-circle')
  })

  it('should set badge to javascript when relationship has value "tome-file" and javascript extension', async () => {
    file.relationship = FileRelationshipType.TomeFile
    file.extension = '.js'

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.badge).toEqual('mdi-language-javascript')
  })

  it('should set badge to json when relationship has value "tome-file" and son extension', async () => {
    file.relationship = FileRelationshipType.TomeFile
    file.extension = '.json'

    const wrapper = factory.wrap({ file })

    expect(wrapper.vm.badge).toEqual('mdi-code-json')
  })
})
