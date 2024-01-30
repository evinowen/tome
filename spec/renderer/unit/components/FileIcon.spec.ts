import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import FileIcon from '@/components/FileIcon.vue'

describe('components/FileIcon', () => {
  let vuetify

  const factory = assemble(FileIcon)
    .context(() => ({
      global: {
        plugins: [ vuetify ],
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

  it('should emit "click" event when button emits "click" event', async () => {
    const wrapper = factory.wrap()

    const button = wrapper.findComponent({ ref: 'button' })
    expect(button.exists()).toBe(true)

    button.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted().click).toBeTruthy()
  })

  it('should enable system flag when relationship has value "git"', async () => {
    const wrapper = factory.wrap({ relationship: 'git' })

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should enable system flag when relationship has value "tome"', async () => {
    const wrapper = factory.wrap({ relationship: 'tome' })

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should enable system flag when relationship has value "tome-templates"', async () => {
    const wrapper = factory.wrap({ relationship: 'tome-templates' })

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should enable system flag when relationship has value "tome-actions"', async () => {
    const wrapper = factory.wrap({ relationship: 'tome-actions' })

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should enable system flag when relationship has value "tome-actions"', async () => {
    const wrapper = factory.wrap({ relationship: 'tome-actions' })

    expect(wrapper.vm.system).toEqual(true)
  })

  it('should set icon as closed directory when flagged as directory and relationship does not have value "root"', async () => {
    const wrapper = factory.wrap({ directory: true })

    expect(wrapper.vm.icon).toEqual('mdi-folder')
  })

  it('should set icon as open directory when flagged as expanded directory and relationship does not have value "root"', async () => {
    const wrapper = factory.wrap({ directory: true, expanded: true })

    expect(wrapper.vm.icon).toEqual('mdi-folder-open')
  })

  it('should set icon as closed book when flagged as directory and relationship has value "root"', async () => {
    const wrapper = factory.wrap({ directory: true, relationship: 'root' })

    expect(wrapper.vm.icon).toEqual('mdi-book')
  })

  it('should set icon as open book when flagged as expanded directory and relationship has value "root"', async () => {
    const wrapper = factory.wrap({ directory: true, expanded: true, relationship: 'root' })

    expect(wrapper.vm.icon).toEqual('mdi-book-open-page-variant')
  })

  it('should set icon as image when flagged as an image', async () => {
    const wrapper = factory.wrap({ image: true })

    expect(wrapper.vm.icon).toEqual('mdi-image')
  })

  it('should clear badge when relationship has value "root"', async () => {
    const wrapper = factory.wrap({ relationship: 'root' })

    expect(wrapper.vm.badge).toEqual('')
  })

  it('should set badge to lock when relationship has value "git"', async () => {
    const wrapper = factory.wrap({ relationship: 'git' })

    expect(wrapper.vm.badge).toEqual('mdi-lock')
  })

  it('should set badge to closed eye when relationship has value "tome"', async () => {
    const wrapper = factory.wrap({ relationship: 'tome' })

    expect(wrapper.vm.badge).toEqual('mdi-minus-circle')
  })

  it('should set badge to open eye when expanded and relationship has value "tome"', async () => {
    const wrapper = factory.wrap({ expanded: true, relationship: 'tome' })

    expect(wrapper.vm.badge).toEqual('mdi-eye-circle')
  })

  it('should set badge to alert when flagged as alert', async () => {
    const wrapper = factory.wrap({ alert: true })

    expect(wrapper.vm.badge).toEqual('mdi-alert-circle')
  })

  it('should set badge to cog when relationship has value "tome-feature-actions"', async () => {
    const wrapper = factory.wrap({ relationship: 'tome-feature-actions' })

    expect(wrapper.vm.badge).toEqual('mdi-cog')
  })

  it('should set badge to cog when relationship has value "tome-feature-templates"', async () => {
    const wrapper = factory.wrap({ relationship: 'tome-feature-templates' })

    expect(wrapper.vm.badge).toEqual('mdi-cog')
  })

  it('should set badge to play arrow when relationship has value "tome-action"', async () => {
    const wrapper = factory.wrap({ relationship: 'tome-action' })

    expect(wrapper.vm.badge).toEqual('mdi-play-circle')
  })

  it('should set badge to lightning when relationship has value "tome-template"', async () => {
    const wrapper = factory.wrap({ relationship: 'tome-template' })

    expect(wrapper.vm.badge).toEqual('mdi-lightning-bolt-circle')
  })

  it('should set badge to cog when relationship has value "tome-feature-actions"', async () => {
    const wrapper = factory.wrap({ relationship: 'tome-feature-actions' })

    expect(wrapper.vm.badge).toEqual('mdi-cog')
  })

  it('should set badge to markdown when relationship has value "tome-file" and markdown extension', async () => {
    const wrapper = factory.wrap({ relationship: 'tome-file', extension: '.md' })

    expect(wrapper.vm.badge).toEqual('mdi-arrow-down-bold-circle')
  })

  it('should set badge to javascript when relationship has value "tome-file" and javascript extension', async () => {
    const wrapper = factory.wrap({ relationship: 'tome-file', extension: '.js' })

    expect(wrapper.vm.badge).toEqual('mdi-language-javascript')
  })

  it('should set badge to json when relationship has value "tome-file" and son extension', async () => {
    const wrapper = factory.wrap({ relationship: 'tome-file', extension: '.json' })

    expect(wrapper.vm.badge).toEqual('mdi-code-json')
  })
})
