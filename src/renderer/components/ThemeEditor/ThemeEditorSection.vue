<template>
  <v-container fluid>
    <slot />
    <theme-font-picker
      :section="section"
      :fonts="fonts"
    />
    <theme-color-picker
      :section="section"
      :colors="colors"
    />
  </v-container>
</template>

<script lang="ts">
import ThemeFontPicker from './ThemeFontPicker.vue'
import ThemeColorPicker from './ThemeColorPicker.vue'
import {
  VContainer,
} from 'vuetify/components'

export default {
  components: {
    ThemeFontPicker,
    ThemeColorPicker,
    VContainer,
  },
}
</script>

<script setup lang="ts">
import { Font } from './ThemeFontPicker.vue'
import { Color } from './ThemeColorPicker.vue'

interface Properties {
  section: string
  fonts: Font[]
  colors: Color[]
}

withDefaults(defineProps<Properties>(), {
  fonts: () => [] as Font[],
  colors: () => [] as Color[],
})
</script>
