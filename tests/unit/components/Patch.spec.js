import Vue from 'vue'
import Vuetify from 'vuetify'

import Patch from '@/components/Patch.vue'

import { createLocalVue, mount } from '@vue/test-utils'

class RepositoryPatch {
  static LineType = {
    CONTEXT: 32,
    ADDITION: 43,
    DELETION: 45,
    CONTEXT_EOFNL: 61,
    ADD_EOFNL: 62,
    DEL_EOFNL: 60,
    FILE_HDR: 70,
    HUNK_HDR: 72,
    BINARY: 66
  }
}

jest.mock('electron', () => ({
  remote: {
    require: jest.fn(),
    dialog: jest.fn()
  }
}))

jest.mock('@/store', () => ({
  state: {
    tome: {
      patches: []
    }
  },
  dispatch: jest.fn()
}))

Vue.use(Vuetify)
const localVue = createLocalVue()

describe('Patch.vue', () => {
  let vuetify
  let wrapper

  let height

  beforeEach(() => {
    vuetify = new Vuetify()

    height = 100

    wrapper = mount(
      Patch,
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

  it('should return "blue--text" from line_color when called with RepositoryPatch.LineType.HUNK_HDR value', async () => {
    const value = wrapper.vm.line_color(RepositoryPatch.LineType.HUNK_HDR)

    expect(value).toEqual('blue--text')
  })

  it('should return "green--text" from line_color when called with RepositoryPatch.LineType.ADDITION value', () => {
    const value = wrapper.vm.line_color(RepositoryPatch.LineType.ADDITION)

    expect(value).toEqual('green--text')
  })

  it('should return "red--text" from line_color when called with RepositoryPatch.LineType.DELETION value', () => {
    const value = wrapper.vm.line_color(RepositoryPatch.LineType.DELETION)

    expect(value).toEqual('red--text')
  })

  it('should return "" from line_color when called with unrecognized value', () => {
    const value = wrapper.vm.line_color('hello?')

    expect(value).toEqual('')
  })

  it('should return "mdi-file-star" from line_prefix when called with RepositoryPatch.LineType.HUNK_HDR value', async () => {
    const value = wrapper.vm.line_prefix(RepositoryPatch.LineType.HUNK_HDR)

    expect(value).toEqual('')
  })

  it('should return "mdi-file-edit" from line_prefix when called with RepositoryPatch.LineType.ADDITION value', () => {
    const value = wrapper.vm.line_prefix(RepositoryPatch.LineType.ADDITION)

    expect(value).toEqual('+ ')
  })

  it('should return "mdi-file-swap" from line_prefix when called with RepositoryPatch.LineType.DELETION value', () => {
    const value = wrapper.vm.line_prefix(RepositoryPatch.LineType.DELETION)

    expect(value).toEqual('- ')
  })

  it('should return "" from line_prefix when called with unrecognized value', () => {
    const value = wrapper.vm.line_prefix('hello?')

    expect(value).toEqual('  ')
  })
})
