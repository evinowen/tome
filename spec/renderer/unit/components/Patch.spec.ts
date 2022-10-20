import { assemble } from '?/helpers'
import Vuetify from 'vuetify'
import Patch from '@/components/Patch.vue'

jest.mock('@/store', () => ({
  state: {
    repository: {
      patches: []
    }
  },
  dispatch: jest.fn()
}
))

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

describe('components/Patch', () => {
  let vuetify
  let height

  const factory = assemble(Patch, { height })
    .context(() => ({
      vuetify,
      stubs: { VDataTable: true }
    }))

  beforeEach(() => {
    vuetify = new Vuetify()
    height = 100
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return "blue--text" from line_color when called with RepositoryPatch.LineType.HUNK_HDR value', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Patch
    const value = local.line_color(RepositoryPatch.LineType.HUNK_HDR)

    expect(value).toEqual('blue--text')
  })

  it('should return "green--text" from line_color when called with RepositoryPatch.LineType.ADDITION value', () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Patch
    const value = local.line_color(RepositoryPatch.LineType.ADDITION)

    expect(value).toEqual('green--text')
  })

  it('should return "red--text" from line_color when called with RepositoryPatch.LineType.DELETION value', () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Patch
    const value = local.line_color(RepositoryPatch.LineType.DELETION)

    expect(value).toEqual('red--text')
  })

  it('should return "" from line_color when called with unrecognized value', () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Patch
    const value = local.line_color('hello?')

    expect(value).toEqual('')
  })

  it('should return "mdi-file-star" from line_prefix when called with RepositoryPatch.LineType.HUNK_HDR value', async () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Patch
    const value = local.line_prefix(RepositoryPatch.LineType.HUNK_HDR)

    expect(value).toEqual('')
  })

  it('should return "mdi-file-edit" from line_prefix when called with RepositoryPatch.LineType.ADDITION value', () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Patch
    const value = local.line_prefix(RepositoryPatch.LineType.ADDITION)

    expect(value).toEqual('+ ')
  })

  it('should return "mdi-file-swap" from line_prefix when called with RepositoryPatch.LineType.DELETION value', () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Patch
    const value = local.line_prefix(RepositoryPatch.LineType.DELETION)

    expect(value).toEqual('- ')
  })

  it('should return "" from line_prefix when called with unrecognized value', () => {
    const wrapper = factory.wrap()
    const local = wrapper.vm as Patch
    const value = local.line_prefix('hello?')

    expect(value).toEqual('  ')
  })
})
