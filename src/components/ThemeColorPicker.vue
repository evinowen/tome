<template>
  <v-card width=180 class="mx-auto">
    <v-card-title class="pa-2">
    <v-switch dense hide-details
      :label=color
      :color=color
      :value=enabled
      @change="$emit('enabled', $event || false)"
      class="mx-auto my-0"
    ></v-switch>
    </v-card-title>
    <v-color-picker v-if=enabled dense tile
      :value="enabled ? value : base" :disabled=!enabled
      @update:color="$emit('input', $event.hex)"
      hex dot-size=16
      hide-mode-switch
      mode="hexa"
      width=180
      canvas-height=78
      style="border-radius: 0"
    ></v-color-picker>
    <template v-else>
      <v-skeleton-loader boilerplate tile
        height=180
        width=180
        type="image, image"
        class="mx-auto"
      ></v-skeleton-loader>
    </template>
  </v-card>
</template>

<style>
.v-color-picker__edit {
  margin-top: 12px;
}

.v-color-picker__input input {
  margin: 0 !important;
}

.v-color-picker__input span {
  display: none;
}
</style>

<style scoped>
.v-label {
  background: black !important;
}

.text-preview {
  max-height: 160px;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>

<script>
import { VCard, VCardTitle, VSwitch, VSkeletonLoader } from 'vuetify/lib'

export default {
  components: { VCard, VCardTitle, VSwitch, VSkeletonLoader },
  props: {
    enabled: { type: Boolean, required: true },
    value: { type: String, required: true },
    color: { type: String, required: true },
    base: { type: String, default: '#000000' }
  }
}
</script>
