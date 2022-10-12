<template>
  <v-card
    class="text-center"
    :loading="loading"
    :disabled="disabled"
  >
    <v-card-text>
      <div class="title text--primary">
        {{ url || '&mdash;' }}
      </div>
      <hr>
      <div class="display-1 text--primary">
        {{ name || '&mdash;' }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { VCard, VCardText } from 'vuetify/lib'

export default Vue.extend({
  components: { VCard, VCardText },
  props: {
    name: { type: String, default: undefined },
    url: { type: String, default: undefined },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  }
})
</script>
