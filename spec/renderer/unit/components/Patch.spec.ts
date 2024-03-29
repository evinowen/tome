import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { createVuetify } from 'vuetify'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as SystemStateDefaults } from '@/store/modules/system'
import { StateDefaults as RepositoryStateDefaults } from '@/store/modules/repository'
import Patch from '@/components/Patch.vue'

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
    BINARY: 66,
  }
}

describe('components/Patch', () => {
  let vuetify
  let store
  let height

  const factory = assemble(Patch, { height })
    .context(() => ({
      global: {
        plugins: [ vuetify, [ store, key ] ],
        stubs: { VDataTable: true },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    store = createStore<State>({
      state: {
        system: SystemStateDefaults(),
        repository: {
          ...RepositoryStateDefaults(),
          path: './tome_path',
        },
      },
    })

    height = 100
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return "blue--text" from line_color when called with RepositoryPatch.LineType.HUNK_HDR value', async () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_color(RepositoryPatch.LineType.HUNK_HDR)

    expect(value).toEqual('blue--text')
  })

  it('should return "green--text" from line_color when called with RepositoryPatch.LineType.ADDITION value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_color(RepositoryPatch.LineType.ADDITION)

    expect(value).toEqual('green--text')
  })

  it('should return "red--text" from line_color when called with RepositoryPatch.LineType.DELETION value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_color(RepositoryPatch.LineType.DELETION)

    expect(value).toEqual('red--text')
  })

  it('should return "" from line_color when called with unrecognized value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_color('hello?')

    expect(value).toEqual('')
  })

  it('should return "mdi-file-star" from line_prefix when called with RepositoryPatch.LineType.HUNK_HDR value', async () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_prefix(RepositoryPatch.LineType.HUNK_HDR)

    expect(value).toEqual('')
  })

  it('should return "mdi-file-edit" from line_prefix when called with RepositoryPatch.LineType.ADDITION value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_prefix(RepositoryPatch.LineType.ADDITION)

    expect(value).toEqual('+ ')
  })

  it('should return "mdi-file-swap" from line_prefix when called with RepositoryPatch.LineType.DELETION value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_prefix(RepositoryPatch.LineType.DELETION)

    expect(value).toEqual('- ')
  })

  it('should return "" from line_prefix when called with unrecognized value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_prefix('hello?')

    expect(value).toEqual('  ')
  })
})
