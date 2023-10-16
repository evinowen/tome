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
        :value="enabled"
        class="mx-auto my-0"
        @update:model-value="$emit('enabled', $event || false)"
      />
    </v-card-title>
    <v-color-picker
      v-if="enabled"
      dense
      rounded="0"
      :model-value="enabled ? value : base"
      :disabled="!enabled"
      hex
      dot-size="16"
      hide-mode-switch
      mode="hexa"
      width="180"
      canvas-height="78"
      style="border-radius: 0"
      @update:model-value="$emit('input', $event.hex)"
    />
    <template v-else>
      <!-- <v-skeleton-loader
        boilerplate
        rounded="0"
        height="180"
        width="180"
        type="image, image"
        class="mx-auto"
      /> -->
    </template>
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import { VCard, VCardTitle, VSwitch, VColorPicker } from 'vuetify/components'

@Component({
  components: { VCard, VCardTitle, VSwitch, VColorPicker }
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
