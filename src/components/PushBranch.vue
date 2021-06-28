<template>
  <v-card class="text-center" :loading=loading :disabled=disabled>
    <v-card-text>
      <div class="title text--primary">{{ url || '&mdash;' }}</div>
      <hr/>
      <div class="display-1 text--primary">{{ name || '&mdash;' }}</div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    name: { type: String, default: null },
    url: { type: String, default: null },
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  }
}
</script>
