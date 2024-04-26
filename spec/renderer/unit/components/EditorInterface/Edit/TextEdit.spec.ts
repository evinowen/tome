import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest'
import { assemble } from '?/helpers'
import { stub_actions } from '?/builders/store'
import { createStore } from 'vuex'
import { State, key } from '@/store'
import { StateDefaults as ActionsStateDefaults } from '@/store/modules/actions'
import { StateDefaults as ConfigurationStateDefaults } from '@/store/modules/configuration'
import { StateDefaults as ComposeStateDefaults } from '@/store/modules/configuration/themes/sections/compose'
import { StateDefaults as SearchStateDefaults } from '@/store/modules/search'
import { File } from '@/store/modules/files'
import TextEdit from '@/components/EditorInterface/Edit/TextEdit.vue'

import { Extension } from '@codemirror/state'

vi.mock('@codemirror/commands', () => ({
  defaultKeymap: [],
  history: vi.fn(),
  historyKeymap: [],
  indentWithTab: [],
}))

vi.mock('@codemirror/language', () => ({
  HighlightStyle: { define: vi.fn(() => []) },
  syntaxHighlighting: vi.fn(),
}))

vi.mock('@codemirror/state', () => {
  const Compartment = class {
    of = vi.fn()
    reconfigure = vi.fn()
  }

  const EditorSelection = class {
    range = vi.fn()
  }

  return {
    Compartment,
    EditorSelection,
    Extension: vi.fn(),
    RangeSetBuilder: vi.fn(),
    EditorState: vi.fn(),
  }
})

vi.mock('@codemirror/search', () => {
  const SearchCursor = class {
    next = () => ({ done: true })
  }

  const RegExpCursor = class {
    next = () => ({ done: true })
  }

  return {
    SearchCursor,
    RegExpCursor,
  }
})

vi.mock('@codemirror/view', () => {
  const Decoration = class {
    static mark = () => new Decoration()
    static none = {}
  }

  const EditorView = class {
    static baseTheme = vi.fn(() => ({} as Extension))
    static scrollIntoView = vi.fn()
    dispatch = vi.fn()
    state = {
      doc: 'document content',
    }
  }

  const ViewPlugin = class {
    static define = (define: () => void) => {
      define()
    }
  }

  return {
    Decoration,
    EditorView,
    keymap: {
      of: vi.fn(),
    },
    lineNumbers: vi.fn(),
    ViewPlugin,
  }
})

vi.mock('@codemirror/lang-markdown', () => ({ markdown: {} as Extension }))
vi.mock('@codemirror/lang-javascript', () => ({ javascript: {} as Extension }))
vi.mock('@codemirror/theme-one-dark', () => ({ oneDark: {} as Extension }))

vi.mock('lodash', () => ({
  debounce: (callback) => {
    callback.cancel = vi.fn()
    callback.flush = vi.fn()
    return callback
  },
  delay: (callback) => callback(),
  cloneDeep: (value) => value,
}))

vi.mock('mark.js', () => {
  class Mark {
    unmark = vi.fn((options) => options.done(true))
    markRegExp = vi.fn((regex, options) => options.done(3))
  }

  return { default: Mark }
})

vi.mock('marked', () => ({
  marked: { parse: vi.fn() },
}))

describe('components/EditorInterface/Edit/TextEdit', () => {
  const file = File.Empty
  file.path = './document.md'

  let store
  let store_dispatch

  const factory = assemble(TextEdit, { file })
    .context(() => ({
      global: {
        plugins: [ [ store, key ] ],
      },
    }))

  beforeEach(() => {
    store = createStore<State>({
      state: {
        actions: ActionsStateDefaults(),
        configuration: {
          ...ConfigurationStateDefaults(),
          themes: {
            light: {
              compose: ComposeStateDefaults(),
            },
          },
        },
        search: SearchStateDefaults(),
      },
      actions: stub_actions([
        'actions/execute',
        'clipboard/text',
        'context/open',
        'files/debounce_save',
        'search/navigate',
      ]),
    })

    store_dispatch = vi.spyOn(store, 'dispatch')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should mount into test scafolding without error', async () => {
    const wrapper = factory.wrap()
    expect(wrapper).toBeDefined()
  })

  it('should dispatch file/debounce_save with document on call to save', async () => {
    const wrapper = factory.wrap()

    const path = './document.md'
    const content = 'document content'

    await wrapper.vm.save(path)

    expect(store_dispatch).toHaveBeenCalledWith('files/debounce_save', { path, content })
  })

  it('should dispatch file/debounce_save with document on call to input', async () => {
    const wrapper = factory.wrap()

    const path = './document.md'
    const content = 'document content'

    await wrapper.vm.input()

    expect(store_dispatch).toHaveBeenCalledWith('files/debounce_save', { path, content })
  })
})
