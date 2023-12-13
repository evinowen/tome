<template>
  <v-btn
    rounded="0"
    size="small"
    variant="text"
    color="primary"
    class="page-button"
  >
    <v-icon size="small">
      <slot />
    </v-icon>
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

<style scoped>
.page-button {
  padding: 0px;
  height: 100%;
  min-height: 0;
  min-width: 30px;
  font-size: 1.2em;
  flex-shrink: 0;
}
</style>
