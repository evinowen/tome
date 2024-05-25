import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import { createVuetify } from 'vuetify'
import CommitList, { RepositoryFileType } from '@/components/CommitList.vue'

describe('components/CommitList', async () => {
  let vuetify
  let height

  const items = [
    { path: './index.md', type: RepositoryFileType.New },
  ]

  const factory = assemble(CommitList, { height, items })
    .context(() => ({
      global: {
        plugins: [ vuetify ],
        stubs: {
          VBtn: BasicComponentStub,
          VIcon: BasicComponentStub,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    height = 100
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return "New" from file_type when called with RepositoryFileType.New value', async () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_type(RepositoryFileType.New)

    expect(value).toEqual('New')
  })

  it('should return "Modified" from file_type when called with RepositoryFileType.Modified value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_type(RepositoryFileType.Modified)

    expect(value).toEqual('Modified')
  })

  it('should return "Renamed" from file_type when called with RepositoryFileType.Renamed value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_type(RepositoryFileType.Renamed)

    expect(value).toEqual('Renamed')
  })

  it('should return "Deleted" from file_type when called with RepositoryFileType.Deleted value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_type(RepositoryFileType.Deleted)

    expect(value).toEqual('Deleted')
  })

  it('should return "" from file_type when called with unrecognized value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_type('hello?')

    expect(value).toEqual('')
  })

  it('should return "green" from file_type when called with RepositoryFileType.New value', async () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_color(RepositoryFileType.New)

    expect(value).toEqual('green')
  })

  it('should return "green" from file_type when called with RepositoryFileType.Modified value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_color(RepositoryFileType.Modified)

    expect(value).toEqual('green')
  })

  it('should return "green" from file_type when called with RepositoryFileType.Renamed value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_color(RepositoryFileType.Renamed)

    expect(value).toEqual('green')
  })

  it('should return "red" from file_type when called with RepositoryFileType.Deleted value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_color(RepositoryFileType.Deleted)

    expect(value).toEqual('red')
  })

  it('should return "" from file_color when called with unrecognized value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_color('hello?')

    expect(value).toEqual('')
  })

  it('should return "mdi-file-star" from file_icon when called with RepositoryFileType.New value', async () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_icon(RepositoryFileType.New)

    expect(value).toEqual('mdi-file-star')
  })

  it('should return "mdi-file-edit" from file_icon when called with RepositoryFileType.Modified value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_icon(RepositoryFileType.Modified)

    expect(value).toEqual('mdi-file-edit')
  })

  it('should return "mdi-file-swap" from file_icon when called with RepositoryFileType.Renamed value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_icon(RepositoryFileType.Renamed)

    expect(value).toEqual('mdi-file-swap')
  })

  it('should return "mdi-file-remove" from file_icon when called with RepositoryFileType.Deleted value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_icon(RepositoryFileType.Deleted)

    expect(value).toEqual('mdi-file-remove')
  })

  it('should return "" from file_icon when called with unrecognized value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.file_icon('hello?')

    expect(value).toEqual('')
  })
})
