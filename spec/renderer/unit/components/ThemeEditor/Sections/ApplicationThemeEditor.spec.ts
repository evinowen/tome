import Component from '?/helpers/component'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import ApplicationThemeEditor from '@/components/ThemeEditor/Sections/ApplicationThemeEditor.vue'

Component('components/ThemeEditor/Sections/ApplicationThemeEditor', ApplicationThemeEditor, { theme: 'light' })
  .stub({
    ApplicationThemePreview: BasicComponentStub,
    ThemeEditorSection: BasicComponentStub,
  })
  .run(async () => { /* Empty */ })
