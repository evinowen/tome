<template>
  <v-card
    width="180"
    class="mx-auto"
  >
    <v-card-title class="pa-2">
      <v-switch
        ref="enabled-switch"
        density="compact"
        hide-details
        :label="color"
        :color="color_state"
        :model-value="enabled_state"
        class="mx-auto my-0"
        @update:model-value="color_enabled($event)"
      />
    </v-card-title>
    <v-color-picker
      ref="color-input"
      rounded="0"
      :model-value="color_state"
      :modes="['rgb']"
      :disabled="!enabled_state"
      hex
      :hide-canvas="!enabled_state"
      :hide-sliders="!enabled_state"
      hide-inputs
      dot-size="16"
      mode="hex"
      width="180"
      canvas-height="64"
      :swatches="[[color_base]]"
      show-swatches
      @update:model-value="color_updated($event)"
    />
  </v-card>
</template>

<script lang="ts">
import {
  VCard,
  VCardTitle,
  VColorPicker,
  VSwitch,
} from 'vuetify/components'

export default {
  components: {
    VCard,
    VCardTitle,
    VColorPicker,
    VSwitch,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'
import { presets } from '@/vuetify'

const store = fetchStore()

export interface Properties {
  theme: string
  color: string
}

const properties = withDefaults(defineProps<Properties>(), {
  theme: '',
  color: '',
})

const enabled_index = computed(() => `${properties.theme}_${properties.color}_enabled`)
const enabled_state = computed(() => store.state.configuration[enabled_index.value] ?? false)

const color_base = computed(() => presets[properties.theme][properties.color] ?? '#000000')
const color_index = computed(() => `${properties.theme}_${properties.color}`)
const color_state = computed(() => store.state.configuration[color_index.value] ?? color_base.value)

async function color_enabled (value) {
  await store.dispatch('configuration/update', { [enabled_index.value]: value })
}

async function color_updated (value) {
  await store.dispatch('configuration/update', { [color_index.value]: value })
}

defineExpose({
  enabled_index,
  color_index,
})
</script>
