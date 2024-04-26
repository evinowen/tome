<template>
  <theme-editor-section
    section="compose"
    :fonts="fonts"
    :colors="colors"
  >
    <compose-theme-preview />
  </theme-editor-section>
</template>

<script lang="ts">
import ComposeThemePreview from './ComposeThemePreview.vue'
import ThemeEditorSection from '../ThemeEditorSection.vue'

export default {
  components: {
    ComposeThemePreview,
    ThemeEditorSection,
  },
}
</script>

<script setup lang="ts">
import { Font } from '../ThemeFontPicker.vue'
import { Color } from '../ThemeColorPicker.vue'

const fonts: Font[] = [
  { label: 'Editor', index: 'editor' },
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
  { label: 'Gutter', index: 'gutters' },
  { label: 'Line Numbers', index: 'line_numbers' },
]
</script>
