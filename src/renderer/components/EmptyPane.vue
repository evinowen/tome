<template>
  <v-container fill-height fluid class="view">
    <v-row align="center" justify="center">
      <v-col class="text-center">
        <slot />
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.view {
  background-image:
    repeating-linear-gradient(
      45deg,
      rgba(128,128,128,.1),
      rgba(128,128,128,.075) 3.5px,
      rgba(64,64,64,.075) 3.5px,
      rgba(64,64,64,.1) 7px
    );
}
</style>

<script lang="ts">
import Vue from 'vue'
import { VContainer, VCol, VRow } from 'vuetify/lib'

export default Vue.extend({
  components: { VContainer, VCol, VRow },
  props: {
    error: { type: String, default: '' }
  }
})
</script>
