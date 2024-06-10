import { it, expect, vi } from 'vitest'
import Component from '?/helpers/component'
import BasicComponent from '?/stubs/BasicComponent.vue'
import ComposeThemePreview from '@/components/ThemeEditor/Sections/ComposeThemePreview.vue'

import { Extension } from '@codemirror/state'

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

vi.mock('@codemirror/view', () => {
  const Decoration = class {
    static mark = () => new Decoration()
    static none = {}
  }

  const EditorView = class {
    static baseTheme = vi.fn(() => ({} as Extension))
    static scrollIntoView = vi.fn()
    static theme = vi.fn()
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

vi.mock('@codemirror/lang-markdown', () => ({ markdown: vi.fn() }))
import { markdown } from '@codemirror/lang-markdown'
const markdown_extension = {} as any
vi.mocked(markdown).mockReturnValue(markdown_extension)

vi.mock('@codemirror/lang-javascript', () => ({ javascript: vi.fn() }))
import { javascript } from '@codemirror/lang-javascript'
const javascript_extension = {} as any
vi.mocked(javascript).mockReturnValue(javascript_extension)

vi.mock('@codemirror/lang-html', () => ({ html: vi.fn() }))
import { html } from '@codemirror/lang-html'
const html_extension = {} as any
vi.mocked(html).mockReturnValue(html_extension)

vi.mock('@/components/ThemeEditor/Sections/Content/Example.md?raw', () => ({ default: 'markdown-content' }))
vi.mock('@/components/ThemeEditor/Sections/Content/Example.js?raw', () => ({ default: 'javascript-content' }))
vi.mock('@/components/ThemeEditor/Sections/Content/Example.html?raw', () => ({ default: 'html-content' }))

Component('components/ThemeEditor/Sections/ComposeThemePreview', ComposeThemePreview, { theme: 'light' })
  .stub({
    ThemeProvider: BasicComponent,
    VSheet: BasicComponent,
    VSelect: BasicComponent,
  })
  .run(async (factory) => {
    it('should set content to blank when language is set to unrecognized value', () => {
      const wrapper = factory.wrap()

      wrapper.vm.language = 'cobol'

      expect(wrapper.vm.content).toEqual('')
    })

    it('should set content to markdown content when language is set to markdown', () => {
      const wrapper = factory.wrap()

      wrapper.vm.language = 'markdown'

      expect(wrapper.vm.content).toEqual('markdown-content')
    })

    it('should load markdown extension when language is set to markdown', () => {
      const wrapper = factory.wrap()

      wrapper.vm.language = 'markdown'

      expect(wrapper.vm.compartments.language.reconfigure).toHaveBeenCalledWith(markdown_extension)
    })

    it('should set content to JavaScript content when language is set to javascript', () => {
      const wrapper = factory.wrap()

      wrapper.vm.language = 'javascript'

      expect(wrapper.vm.content).toEqual('javascript-content')
    })

    it('should load JavaScript extension when language is set to javascript', () => {
      const wrapper = factory.wrap()

      wrapper.vm.language = 'javascript'

      expect(wrapper.vm.compartments.language.reconfigure).toHaveBeenCalledWith(javascript_extension)
    })

    it('should set content to HTML content when language is set to html', () => {
      const wrapper = factory.wrap()

      wrapper.vm.language = 'html'

      expect(wrapper.vm.content).toEqual('html-content')
    })

    it('should load HTML extension when language is set to html', () => {
      const wrapper = factory.wrap()

      wrapper.vm.language = 'html'

      expect(wrapper.vm.compartments.language.reconfigure).toHaveBeenCalledWith(html_extension)
    })
  })
