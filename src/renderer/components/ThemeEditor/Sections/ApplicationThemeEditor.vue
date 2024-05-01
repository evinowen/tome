<template>
  <theme-editor-section
    section="application"
    :fonts="fonts"
    :colors="colors"
  >
    <application-theme-preview />
  </theme-editor-section>
</template>

<script lang="ts">
import ApplicationThemePreview from './ApplicationThemePreview.vue'
import ThemeEditorSection from '../ThemeEditorSection.vue'

export default {
  components: {
    ApplicationThemePreview,
    ThemeEditorSection,
  },
}
</script>

<script setup lang="ts">
import { Font } from '../ThemeFontPicker.vue'
import { Color } from '../ThemeColorPicker.vue'

const fonts: Font[] = [
  { label: 'Title', index: 'title' },
  { label: 'Content', index: 'content' },
  { label: 'Monospace', index: 'monospace' },
]

const colors: Color[] = [
  { label: 'Background', index: 'background' },
  { label: 'Surface', index: 'surface' },
  { label: 'Primary', index: 'primary' },
  { label: 'Secondary', index: 'secondary' },
  { label: 'Accent', index: 'accent' },
  { label: 'Error', index: 'error' },
  { label: 'Info', index: 'info' },
  { label: 'Success', index: 'success' },
  { label: 'Warning', index: 'warning' },
]
</script>
