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
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import { VCard, VCardTitle, VSwitch, VColorPicker } from 'vuetify/components'

@Component({
  components: { VCard, VCardTitle, VSwitch, VColorPicker },
  emits: [ "enabled", "input" ]
})
class ThemeColorPicker extends Vue {
  @Prop({ default: true })
  enabled: boolean

  @Prop({ default: true })
  value: string

  @Prop({ default: true })
  color: string

  @Prop({ default: '#000000' })
  base: string
}

export default toNative(ThemeColorPicker)
</script>

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
