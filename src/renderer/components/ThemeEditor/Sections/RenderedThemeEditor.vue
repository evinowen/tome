<template>
  <theme-editor-section
    section="rendered"
    :fonts="fonts"
    :colors="colors"
  >
    <rendered-theme-preview />
  </theme-editor-section>
</template>

<script lang="ts">
import RenderedThemePreview from './RenderedThemePreview.vue'
import ThemeEditorSection from '../ThemeEditorSection.vue'

export default {
  components: {
    RenderedThemePreview,
    ThemeEditorSection,
  },
}
</script>

<script setup lang="ts">
import { Font } from '../ThemeFontPicker.vue'
import { Color } from '../ThemeColorPicker.vue'

const fonts: Font[] = [
  { label: 'Header', index: 'header' },
  { label: 'Content', index: 'content' },
]

const colors: Color[] = [
  { label: 'Background', index: 'background' },
  { label: 'Header I', index: 'header_1' },
  { label: 'Header II', index: 'header_2' },
  { label: 'Header III', index: 'header_3' },
  { label: 'Header IV', index: 'header_4' },
  { label: 'Header V', index: 'header_5' },
  { label: 'Header VI', index: 'header_6' },
  { label: 'Content', index: 'content' },
  { label: 'Archor', index: 'anchor' },
]
</script>
