<template>
  <v-container fluid>
    <slot />
    <theme-font-picker
      :theme="theme"
      :section="section"
      :fonts="fonts"
    />
    <theme-color-picker
      :theme="theme"
      :section="section"
      :colors="colors"
    />
  </v-container>
</template>

<script lang="ts">
import { Font as ThemeFontPickerFont } from './ThemeFontPicker.vue'
export type Font = ThemeFontPickerFont

import { Color as ThemeColorPickerColor } from './ThemeColorPicker.vue'
export type Color = ThemeColorPickerColor

</script>

<script setup lang="ts">
import ThemeFontPicker from './ThemeFontPicker.vue'
import ThemeColorPicker from './ThemeColorPicker.vue'
import {
  VContainer,
} from 'vuetify/components'

interface Properties {
  section: string
  theme: string
  fonts: Font[]
  colors: Color[]
}

withDefaults(defineProps<Properties>(), {
  theme: 'light',
  fonts: () => [] as Font[],
  colors: () => [] as Color[],
})
</script>
