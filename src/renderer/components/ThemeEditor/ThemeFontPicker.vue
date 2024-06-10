<template>
  <v-container pa="4">
    <theme-font-picker-option
      v-for="font in fonts"
      :key="font.index"
      :theme="theme"
      :section="section"
      :label="font.label"
      :index="font.index"
    />
  </v-container>
</template>

<script lang="ts">
export interface Font {
  label: string
  index: string
}
</script>

<script setup lang="ts">
import ThemeFontPickerOption from './ThemeFontPickerOption.vue'
import {
  VContainer,
} from 'vuetify/components'

interface Properties {
  theme: string
  section: string
  fonts: Font[]
}

withDefaults(defineProps<Properties>(), {
  theme: 'light',
  section: '',
  fonts: () => ([] as Font[]),
})
</script>
