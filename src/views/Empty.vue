<template>
  <v-container fill-height fluid class="main_screen">
    <v-row align="center"
        justify="center">
        <v-col class="text-center grey--text text--lighten-2">
          <v-icon x-large class=" grey--text text--lighten-2" style="font-size: 160px;">mdi-bookshelf</v-icon>
          <p><slot></slot></p>

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

/* .main_screen {
  font-family: Roboto, sans-serif;
  background-position: center center;
  background-color: hsl(2, 60%, 20%);
  background-image:
    repeating-linear-gradient(
      transparent,
      transparent 50px,
      rgba(0,0,0,.4) 50px,
      rgba(0,0,0,.4) 53px,
      transparent 53px,
      transparent 63px,
      rgba(0,0,0,.4) 63px,
      rgba(0,0,0,.4) 66px,
      transparent 66px,
      transparent 116px,
      rgba(0,0,0,.5) 116px,
      rgba(0,0,0,.5) 166px,
      rgba(255,255,255,.1) 166px,
      rgba(255,255,255,.1) 169px,
      rgba(0,0,0,.5) 169px,
      rgba(0,0,0,.5) 179px,
      rgba(255,255,255,.1) 179px,
      rgba(255,255,255,.1) 182px,
      rgba(0,0,0,.5) 182px,
      rgba(0,0,0,.5) 232px,
      transparent 232px
    ),
    repeating-linear-gradient(
      270deg,
      transparent,
      transparent 50px,
      rgba(0,0,0,.4) 50px,
      rgba(0,0,0,.4) 53px,
      transparent 53px,
      transparent 63px,
      rgba(0,0,0,.4) 63px,
      rgba(0,0,0,.4) 66px,
      transparent 66px,
      transparent 116px,
      rgba(0,0,0,.5) 116px,
      rgba(0,0,0,.5) 166px,
      rgba(255,255,255,.1) 166px,
      rgba(255,255,255,.1) 169px,
      rgba(0,0,0,.5) 169px,
      rgba(0,0,0,.5) 179px,
      rgba(255,255,255,.1) 179px,
      rgba(255,255,255,.1) 182px,
      rgba(0,0,0,.5) 182px,
      rgba(0,0,0,.5) 232px,
      transparent 232px
    ),
    repeating-linear-gradient(
      125deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,.2) 2px,
      rgba(0,0,0,.2) 3px,
      transparent 3px,
      transparent 5px,
      rgba(0,0,0,.2) 5px
    );
} */

</style>

<script>
export default {
  props: {
    error: String
  },
  data: () => ({
  })
}
</script>
