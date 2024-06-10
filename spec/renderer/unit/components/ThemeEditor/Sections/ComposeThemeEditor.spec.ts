import { it, expect, vi } from 'vitest'
import Component from '?/helpers/component'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import ComposeThemeEditor from '@/components/ThemeEditor/Sections/ComposeThemeEditor.vue'

Component('components/ThemeEditor/Sections/ComposeThemeEditor', ComposeThemeEditor, { theme: 'light' })
  .stub({
    ComposeThemePreview: BasicComponentStub,
    ThemeEditorSection: BasicComponentStub,
  })
  .run(async (factory) => { /* Empty */ })
