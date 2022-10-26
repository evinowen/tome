<template>
  <v-container
    fill-height
    fluid
    class="view"
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col class="text-center">
        <slot />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { VContainer, VCol, VRow } from 'vuetify/lib'

export const EmptyPaneProperties = Vue.extend({
  props: {
    error: { type: String, default: '' }
  }
})

@Component({
  components: { VContainer, VCol, VRow }
})
export default class EmptyPane extends EmptyPaneProperties {}
</script>

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
