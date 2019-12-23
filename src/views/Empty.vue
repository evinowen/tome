<template>
  <div style="text-align: center">
        <v-icon x-large class="grey--text lighten-3--text">mdi-skull-outline</v-icon>
        <p><strong><slot></slot></strong></p>
  </div>

</template>

<script>
  export default {
    props: {
      error: String,
    },
    data: () => ({
    }),
  }
</script>