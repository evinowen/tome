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
import {
  VSwitch,
} from 'vuetify/components'

export default {
  components: {
    VSwitch,
  },
  emits: [
    'click',
  ]
}
</script>

<script setup lang="ts">
export interface Props {
  value: boolean,
}

withDefaults(defineProps<Props>(), {
  value: false,
})
</script>

<style scoped>
@layer edit-switch {
  #edit-switch {
    flex-grow: 0;
    flex-shrink: 0;
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
