import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import BasicComponent from '?/stubs/BasicComponent.vue'
import UtilityPage from '?/stubs/UtilityPage.vue'
import { createVuetify } from 'vuetify'
import { createTestingPinia } from '@pinia/testing'
import Patch, { RepositoryPatchLineType } from '@/components/Patch.vue'
import { fetch_system_store } from '@/store/modules/system'

describe('components/Patch', () => {
  let vuetify
  let pinia
  let height
  const factory = assemble(Patch, { height })
    .context(() => ({
      global: {
        plugins: [ vuetify, pinia ],
        stubs: {
          UtilityPage,
          VCard: BasicComponent,
          VCardText: BasicComponent,
          VCardTitle: BasicComponent,
        },
      },
    }))

  beforeEach(() => {
    vuetify = createVuetify()

    pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        'repository': {
          path: './tome_path',
        },
        'repository-comparator': {
          patches: [
            {
              name: 'Example.md',
              path: '/project/example.md',
              lines: [
                { type: RepositoryPatchLineType.HUNK_HDR, line: 'ABCabc123' },
                { type: RepositoryPatchLineType.ADDITION, line: 'ABCabc123' },
                { type: RepositoryPatchLineType.DELETION, line: 'ABCabc123' },
              ],
            },
          ],
        },
      },
    })

    height = 100
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should return "blue--text" from line_color when called with RepositoryPatchLineType.HUNK_HDR value', async () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_color(RepositoryPatchLineType.HUNK_HDR)

    expect(value).toEqual('blue--text')
  })

  it('should return "green--text" from line_color when called with RepositoryPatchLineType.ADDITION value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_color(RepositoryPatchLineType.ADDITION)

    expect(value).toEqual('green--text')
  })

  it('should return "red--text" from line_color when called with RepositoryPatchLineType.DELETION value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_color(RepositoryPatchLineType.DELETION)

    expect(value).toEqual('red--text')
  })

  it('should return "" from line_color when called with unrecognized value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_color('hello?')

    expect(value).toEqual('')
  })

  it('should return "mdi-file-star" from line_prefix when called with RepositoryPatchLineType.HUNK_HDR value', async () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_prefix(RepositoryPatchLineType.HUNK_HDR)

    expect(value).toEqual('')
  })

  it('should return "mdi-file-edit" from line_prefix when called with RepositoryPatchLineType.ADDITION value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_prefix(RepositoryPatchLineType.ADDITION)

    expect(value).toEqual('+ ')
  })

  it('should return "mdi-file-swap" from line_prefix when called with RepositoryPatchLineType.DELETION value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_prefix(RepositoryPatchLineType.DELETION)

    expect(value).toEqual('- ')
  })

  it('should return "" from line_prefix when called with unrecognized value', () => {
    const wrapper = factory.wrap()
    const value = wrapper.vm.line_prefix('hello?')

    expect(value).toEqual('  ')
  })

  it('should dispatch "system/patch" upon call to close method', async () => {
    const system = fetch_system_store()

    const wrapper = factory.wrap()

    await wrapper.vm.close()

    expect(system.page).toHaveBeenCalledWith({ patch: false })
  })
})
