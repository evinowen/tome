<template>
  <v-container fill-height fluid class="main_screen">
    <v-row align="center"
        justify="center">
        <v-col class="text-center grey--text text--lighten-2">
          <v-icon x-large class=" grey--text text--lighten-2" style="font-size: 120px;">mdi-bookshelf</v-icon>
          <h1><slot></slot></h1>
          <!-- <hr /> -->
          <br />
          <p v-for="action in actions" :key="action.name">
            <v-btn dense @click.stop="action.action"><v-icon class="mr-2">{{ action.icon }}</v-icon> {{ action.name }}</v-btn>
          </p>

        </v-col>
    </v-row>
  </v-container>

</template>

<style>
.main_screen {
  background-color: rgb(42, 42, 42);
  background-image:
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 3.5px,
      rgba(50,50,50,.8) 3.5px,
      rgba(50,50,50,.5) 7px
    );

}

</style>

<script>
  export default {
    props: {
      actions: Array,
    },
    data: () => ({
    }),
  }
</script>