<template>
  <div id="edit-switch">
    <v-switch
      action-bar-edit
      :value="value"
      inset
      hide-details
      class="edit-switch"
      :color="value ? 'primary' : undefined"
      @click="$emit('click', $event)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import { VSwitch } from 'vuetify/components'

@Component({
  components: {
    VSwitch
  },
  emits: [
    'click'
  ]
})
class EditSwitch extends Vue {
  @Prop({ default: false })
  value: boolean
}

export default toNative(EditSwitch)
</script>

<style scoped>
@layer edit-switch {
  #edit-switch {
    flex-grow: 0;
    padding: 0 2px !important;
  }

  #edit-switch :deep(*) {
    --v-selection-control-size: 12px;
    --v-input-control-height: 100%;
  }

  #edit-switch :deep(.v-switch__track) {
    height: 16px !important;
    width: 36px !important;
  }

  #edit-switch :deep(.v-switch__thumb) {
    height: 12px !important;
    width: 12px !important;
  }
}
</style>
