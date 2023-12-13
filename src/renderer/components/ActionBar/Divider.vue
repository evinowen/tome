<template>
  <v-divider
    inset
    vertical
    class="divider"
  />
</template>

<script lang="ts">
import {
  VDivider,
} from 'vuetify/components'

export default {
  components: {
    VDivider,
  }
}
</script>

<style scoped>
.divider {
  margin-top: 3px;
  max-height: calc(100% - 8px);
}
</style>
