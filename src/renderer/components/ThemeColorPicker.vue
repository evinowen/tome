<template>
  <v-card
    width="180"
    class="mx-auto"
  >
    <v-card-title class="pa-2">
      <v-switch
        density="compact"
        hide-details
        :label="color"
        :color="color"
        :model-value="enabled"
        class="mx-auto my-0"
        @update:model-value="$emit('enabled', !enabled)"
      />
    </v-card-title>
    <v-color-picker
      rounded="0"
      :model-value="enabled ? value : base"
      :modes="['rgb']"
      :disabled="!enabled"
      hex
      :hide-canvas="!enabled"
      :hide-sliders="!enabled"
      hide-inputs
      dot-size="16"
      mode="hex"
      width="180"
      canvas-height="64"
      :swatches="[[base]]"
      show-swatches
      @update:model-value="$emit('input', $event)"
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
  emits: [
    'enabled',
    'input',
  ]
}
</script>

<script setup lang="ts">
export interface Props {
  base: string,
  color: string,
  enabled: boolean,
  value: string,
}

withDefaults(defineProps<Props>(), {
  base: '#000000',
  color: '',
  enabled: true,
  value: '',
})
</script>
