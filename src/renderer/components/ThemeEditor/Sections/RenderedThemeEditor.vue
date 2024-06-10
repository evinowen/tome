<template>
  <theme-editor-section
    :theme="theme"
    section="rendered"
    :fonts="fonts"
    :colors="colors"
  >
    <rendered-theme-preview :theme="theme" />
  </theme-editor-section>
</template>

<script setup lang="ts">
import RenderedThemePreview from './RenderedThemePreview.vue'
import ThemeEditorSection from '../ThemeEditorSection.vue'
import { Font } from '../ThemeFontPicker.vue'
import { Color } from '../ThemeColorPicker.vue'

export interface Properties {
  theme: string
}

withDefaults(defineProps<Properties>(), {
  theme: 'light',
})

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
  { label: 'Selection', index: 'selection' },
  { label: 'Highlight', index: 'highlight' },
  { label: 'Highlight Focused', index: 'highlight_focus' },
]
</script>
