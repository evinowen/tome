import Component from '?/helpers/component'
import BasicComponentStub from '?/stubs/BasicComponentStub'
import RenderedThemePreview from '@/components/ThemeEditor/Sections/RenderedThemePreview.vue'

Component('components/ThemeEditor/Sections/RenderedThemePreview', RenderedThemePreview, { theme: 'light' })
  .stub({
    RenderedViewport: BasicComponentStub,
    ThemeProvider: BasicComponentStub,
  })
  .run(async () => { /* Empty */ })
