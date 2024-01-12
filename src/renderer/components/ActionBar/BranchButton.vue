<template>
  <v-btn
    rounded="0"
    size="small"
    class="branch-button px-2"
    :color="branch ? 'primary' : 'error'"
    variant="flat"
  >
    <v-icon
      v-if="!branch"
      ref="error_icon"
      size="small"
      class="pr-1"
    >
      mdi-alert-box
    </v-icon>
    {{ branch || error }}
  </v-btn>
</template>

<script lang="ts">
import {
  VBtn,
  VIcon,
} from 'vuetify/components'

export default {
  components: {
    VBtn,
    VIcon,
  }
}
</script>

<script setup lang="ts">
export interface Props {
  branch: string,
  error: string,
}

withDefaults(defineProps<Props>(), {
  branch: '',
  error: '',
})
</script>

<style scoped>
.branch-button {
  padding: 0px;
  height: 100%;
  min-height: 0;
  min-width: 30px;
}
</style>
