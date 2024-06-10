import { it, expect } from 'vitest'
import Component from '?/helpers/component'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import RenderedThemeEditor from '@/components/ThemeEditor/Sections/RenderedThemeEditor.vue'

Component('components/ThemeEditor/Sections/RenderedThemeEditor', RenderedThemeEditor, { theme: 'light' })
  .stub({
    RenderedThemePreview: BasicComponentStub,
    ThemeEditorSection: BasicComponentStub,
  })
  .run(async (factory) => { /* Empty */ })
