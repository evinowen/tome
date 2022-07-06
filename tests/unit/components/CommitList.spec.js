import Vue from 'vue'
import Vuetify from 'vuetify'

import CommitList from '@/components/CommitList.vue'
import RepositoryFile from '@/../electron/components/git/RepositoryFile'

import { createLocalVue, mount } from '@vue/test-utils'

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('CommitList.vue', () => {
  let vuetify
  let wrapper

  let height

  beforeEach(() => {
    vuetify = new Vuetify()

    height = 100

    wrapper = mount(
      CommitList,
      {
        localVue,
        vuetify,
        stubs: {
          VDataTable: true
        },
        propsData: {
          height
        }
      }
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set datatable height value based on resize input when resize method is triggered', async () => {
    expect(wrapper.vm.datatable.height).toEqual(100)

    height = 600

    wrapper.vm.resize()

    expect(wrapper.vm.datatable.height).toEqual(100)
  })

  it('should return "New" from file_type when called with RepositoryFile.Type.NEW value', async () => {
    const value = wrapper.vm.file_type(RepositoryFile.Type.NEW)

    expect(value).toEqual('New')
  })

  it('should return "Modified" from file_type when called with RepositoryFile.Type.MODIFIED value', () => {
    const value = wrapper.vm.file_type(RepositoryFile.Type.MODIFIED)

    expect(value).toEqual('Modified')
  })

  it('should return "Renamed" from file_type when called with RepositoryFile.Type.RENAMED value', () => {
    const value = wrapper.vm.file_type(RepositoryFile.Type.RENAMED)

    expect(value).toEqual('Renamed')
  })

  it('should return "Deleted" from file_type when called with RepositoryFile.Type.DELETED value', () => {
    const value = wrapper.vm.file_type(RepositoryFile.Type.DELETED)

    expect(value).toEqual('Deleted')
  })

  it('should return "" from file_type when called with unrecognized value', () => {
    const value = wrapper.vm.file_type('hello?')

    expect(value).toEqual('')
  })

  it('should return "green" from file_type when called with RepositoryFile.Type.NEW value', async () => {
    const value = wrapper.vm.file_color(RepositoryFile.Type.NEW)

    expect(value).toEqual('green')
  })

  it('should return "green" from file_type when called with RepositoryFile.Type.MODIFIED value', () => {
    const value = wrapper.vm.file_color(RepositoryFile.Type.MODIFIED)

    expect(value).toEqual('green')
  })

  it('should return "green" from file_type when called with RepositoryFile.Type.RENAMED value', () => {
    const value = wrapper.vm.file_color(RepositoryFile.Type.RENAMED)

    expect(value).toEqual('green')
  })

  it('should return "red" from file_type when called with RepositoryFile.Type.DELETED value', () => {
    const value = wrapper.vm.file_color(RepositoryFile.Type.DELETED)

    expect(value).toEqual('red')
  })

  it('should return "" from file_color when called with unrecognized value', () => {
    const value = wrapper.vm.file_color('hello?')

    expect(value).toEqual('')
  })

  it('should return "mdi-file-star" from file_icon when called with RepositoryFile.Type.NEW value', async () => {
    const value = wrapper.vm.file_icon(RepositoryFile.Type.NEW)

    expect(value).toEqual('mdi-file-star')
  })

  it('should return "mdi-file-edit" from file_icon when called with RepositoryFile.Type.MODIFIED value', () => {
    const value = wrapper.vm.file_icon(RepositoryFile.Type.MODIFIED)

    expect(value).toEqual('mdi-file-edit')
  })

  it('should return "mdi-file-swap" from file_icon when called with RepositoryFile.Type.RENAMED value', () => {
    const value = wrapper.vm.file_icon(RepositoryFile.Type.RENAMED)

    expect(value).toEqual('mdi-file-swap')
  })

  it('should return "mdi-file-remove" from file_icon when called with RepositoryFile.Type.DELETED value', () => {
    const value = wrapper.vm.file_icon(RepositoryFile.Type.DELETED)

    expect(value).toEqual('mdi-file-remove')
  })

  it('should return "" from file_icon when called with unrecognized value', () => {
    const value = wrapper.vm.file_icon('hello?')

    expect(value).toEqual('')
  })
})
