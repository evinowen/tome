<template>
  <div pa="4">
    <v-autocomplete
      :label="label"
      clearable
      density="compact"
      :items="fonts"
      :model-value="target.family"
      @update:model-value="update_family"
    />
    <v-slider
      :min="0.25"
      :max="2"
      :ticks="ticks"
      show-ticks="always"
      :step="0.25"
      tick-size="4"
      :model-value="target.size"
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
import { fetchStore } from '@/store'
import { library as font_library } from '@/fonts'

const store = fetchStore()

const fonts = computed(() => [ ...font_library.keys() ])
const ticks = [ '0.25', '0.50', '0.75', '1.00', '1.25', '1.50', '1.75', '2.00' ]

interface Properties {
  section: string
  label: string
  index: string
}

const properties = withDefaults(defineProps<Properties>(), {
  section: '',
  label: '',
  index: '',
})

const target = computed(() => {
  const assemble = (name, data) => {
    return {
      store: `configuration/themes/${name}/${properties.section}/update`,
      family: data[`font_family_${properties.index}`],
      size: data[`font_size_${properties.index}`],
    }
  }

  return store.state.configuration.dark_mode
    ? assemble('dark', store.state.configuration.themes.dark[properties.section])
    : assemble('light', store.state.configuration.themes.light[properties.section])
})

async function update_family (value) {
  await store.dispatch(target.value.store, { [`font_family_${properties.index}`]: value ?? '' })
}

async function update_size (value) {
  await store.dispatch(target.value.store, { [`font_size_${properties.index}`]: value ?? '' })
}
</script>
