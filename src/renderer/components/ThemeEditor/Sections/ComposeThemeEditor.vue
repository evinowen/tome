<template>
  <theme-editor-section
    :theme="theme"
    section="compose"
    :fonts="fonts"
    :colors="colors"
  >
    <compose-theme-preview :theme="theme" />
  </theme-editor-section>
</template>

<script setup lang="ts">
import ComposeThemePreview from './ComposeThemePreview.vue'
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
  { label: 'Compose', index: 'compose' },
]

const colors: Color[] = [
  { label: 'Background', index: 'background' },
  { label: 'Gutter', index: 'gutters' },
  { label: 'Line Numbers', index: 'line_numbers' },
  { label: 'Content', index: 'content' },
  { label: 'Comments', index: 'comments' },
  { label: 'Archor', index: 'anchor' },
  { label: 'Header I', index: 'header_1' },
  { label: 'Header II', index: 'header_2' },
  { label: 'Header III', index: 'header_3' },
  { label: 'Header IV', index: 'header_4' },
  { label: 'Header V', index: 'header_5' },
  { label: 'Header VI', index: 'header_6' },
  { label: 'Keywords', index: 'keywords' },
  { label: 'Operators', index: 'operators' },
  { label: 'Types', index: 'types' },
  { label: 'Brackets', index: 'brackets' },
  { label: 'Strings', index: 'strings' },
  { label: 'Numbers', index: 'numbers' },
  { label: 'Booleans', index: 'booleans' },
  { label: 'Selection', index: 'selection' },
  { label: 'Highlight', index: 'highlight' },
  { label: 'Highlight Focused', index: 'highlight_focus' },
]
</script>
