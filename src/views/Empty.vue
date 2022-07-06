<template>
  <v-container fill-height fluid class="main_screen">
    <v-row align="center" justify="center">
        <v-col class="text-center grey--text text--lighten-2">
          <slot></slot>
        </v-col>
    </v-row>
  </v-container>

</template>

<style>
.main_screen {
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

<script>
import { VContainer, VCol, VRow } from 'vuetify/lib'

export default {
  components: { VContainer, VCol, VRow },
  props: {
    error: String
  }
}
</script>
