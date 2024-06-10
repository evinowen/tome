<template>
  <div pa="4">
    <v-autocomplete
      :label="label"
      clearable
      density="compact"
      :items="fonts.families"
      :model-value="family_value"
      @update:model-value="update_family"
    />
    <v-slider
      :min="0.25"
      :max="2"
      :ticks="ticks"
      show-ticks="always"
      :step="0.25"
      tick-size="4"
      :model-value="size_value"
      @update:model-value="update_size"
    />
  </div>
</template>

<script lang="ts">
import {
  VAutocomplete,
  VSlider,
} from 'vuetify/components'

export default {
  components: {
    VAutocomplete,
    VSlider,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_fonts_store } from '@/store/modules/fonts'

const configuration = fetch_configuration_store()
const fonts = fetch_fonts_store()

const ticks = [ '0.25', '0.50', '0.75', '1.00', '1.25', '1.50', '1.75', '2.00' ]

interface Properties {
  theme: string
  section: string
  label: string
  index: string
}

const properties = withDefaults(defineProps<Properties>(), {
  theme: 'light',
  section: '',
  label: '',
  index: '',
})

const family_value = computed(() => configuration[configuration.target].themes[properties.theme][properties.section][`font_family_${properties.index}`] ?? '')
const size_value = computed(() => configuration[configuration.target].themes[properties.theme][properties.section][`font_size_${properties.index}`] ?? '')

async function update_family (value) {
  await configuration.update(configuration.target, `themes.${properties.theme}.${properties.section}.font_family_${properties.index}`, value ?? '')
}

async function update_size (value) {
  await configuration.update(configuration.target, `themes.${properties.theme}.${properties.section}.font_size_${properties.index}`, value ?? '')
}

defineExpose({
  update_family,
  update_size,
})
</script>
