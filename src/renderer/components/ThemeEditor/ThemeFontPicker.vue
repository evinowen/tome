<template>
  <v-container pa="4">
    <theme-font-picker-option
      v-for="font in fonts"
      :key="font.index"
      :section="section"
      :label="font.label"
      :index="font.index"
    />
  </v-container>
</template>

<script lang="ts">
import ThemeFontPickerOption from './ThemeFontPickerOption.vue'
import {
  VContainer,
} from 'vuetify/components'

export interface Font {
  label: string
  index: string
}

export default {
  components: {
    ThemeFontPickerOption,
    VContainer,
  },
}
</script>

<script setup lang="ts">
interface Properties {
  section: string
  fonts: Font[]
}

withDefaults(defineProps<Properties>(), {
  section: '',
  fonts: () => ([] as Font[]),
})
</script>
