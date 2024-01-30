<template>
  <v-card
    class="text-center"
    :loading="loading"
    :disabled="disabled"
  >
    <v-card-text>
      <div class="text-h6 text--primary">
        {{ url || '&mdash;' }}
      </div>
      <hr>
      <div class="text-h4 text--primary">
        {{ name || '&mdash;' }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import {
  VCard,
  VCardText,
} from 'vuetify/components'

export default {
  components: {
    VCard,
    VCardText,
  },
}
</script>

<script setup lang="ts">
export interface Properties {
  name?: string
  url?: string
  loading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Properties>(), {
  name: '',
  url: '',
  loading: false,
  disabled: false,
})
</script>
