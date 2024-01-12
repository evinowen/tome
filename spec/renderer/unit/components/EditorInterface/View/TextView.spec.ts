import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { stub_actions } from '?/builders/store'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ActionsStateDefaults } from '@/store/modules/actions'
import { StateDefaults as SearchStateDefaults } from '@/store/modules/search'
import { File } from '@/store/modules/files'
import TextView from '@/components/EditorInterface/View/TextView.vue'

vi.mock('mark.js', () => {
  class Mark {
    unmark = vi.fn((options) => options.done(true))
    markRegExp = vi.fn((regex, options) => options.done(3))
  }

  return { default: Mark }
})

vi.mock('marked', () => ({
  marked: { parse: vi.fn() }
}))

describe('components/EditorInterface/View/TextView', () => {
  let file = File.Empty
  let store

  const factory = assemble(TextView, { file })
  .context(() => ({
      global: {
        plugins: [ [store, key] ],
      }
    }))

  beforeEach(() => {
    store = createStore<State>({
      state: {
        actions: ActionsStateDefaults(),
        search: SearchStateDefaults(),
      },
      actions: stub_actions([
        'actions/execute',
        'clipboard/text',
        'context/open',
        'error',
        'search/navigate',
      ]),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })
})
