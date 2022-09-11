<template>
  <v-layout style="height: 100%;" @click.stop=click>
    <v-flex grow class="sea" ref="sea" >
      <div ref="boat" class="boat">
        <v-icon>mdi-sail-boat</v-icon>
      </div>
      <div ref="cannon_ball" class="cannon_ball">
        <v-icon>
          {{ cannon.ball.sunk ? '' : 'mdi-circle-small' }}
        </v-icon>
      </div>
      <div ref="splash" class="splash">
        <v-icon>
          {{ 'mdi-circle-outline' }}
        </v-icon>
      </div>
    </v-flex>
  </v-layout>
</template>

<style scoped>
.sea {
  position: relative;
  overflow: hidden;
  height: 100%;
}

.boat {
  position: absolute;
  bottom: 24px;
  left: 24px;
}

.cannon_ball {
  position: absolute;
  bottom: -128px;
  left: -128px;
  width: 10px;
  height: 10px;
  transition: unset;
}

.splash {
  position: absolute;
  transform: rotateX(60deg);
}
</style>

<script>
import { VLayout, VFlex, VIcon } from 'vuetify/lib'

export default {
  components: { VLayout, VFlex, VIcon },
  data: () => ({
    ticker: null,
    cannon: {
      ball: {
        sunk: true,
        x: 0,
        y: 0,
        dx: 0,
        dy: 0
      }
    }
  }),
  mounted: function () {
    clearInterval(this.ticker)
    this.ticker = setInterval(() => this.tick(), 50)
  },
  unmounted: function () {
    clearInterval(this.ticker)
  },
  computed: {
  },
  methods: {
    click: async function (event) {
      if (!this.$refs.sea) {
        return
      }

      if (!this.$refs.boat) {
        return
      }

      if (!this.cannon.ball.sunk) {
        return
      }

      const sea_rect = this.$refs.sea.getBoundingClientRect()
      const boat_rect = this.$refs.boat.getBoundingClientRect()

      this.cannon.ball.x = boat_rect.left - sea_rect.left
      this.cannon.ball.y = boat_rect.top - sea_rect.top
      this.cannon.ball.dx = 2
      this.cannon.ball.dy = 1

      this.cannon.ball.sunk = false

      await this.update()
    },
    tick: async function () {
      if (this.cannon.ball.sunk) {
        return
      }

      this.cannon.ball.dy -= 0.05

      this.cannon.ball.x += this.cannon.ball.dx
      this.cannon.ball.y -= this.cannon.ball.dy

      const sea_rect = this.$refs.sea.getBoundingClientRect()
      const boat_rect = this.$refs.boat.getBoundingClientRect()

      if (this.cannon.ball.y > boat_rect.top - sea_rect.top + 4) {
        this.cannon.ball.sunk = true
      }

      await this.update()
    },
    update: async function () {
      if (!this.$refs.cannon_ball) {
        return
      }

      if (this.cannon.ball.sunk) {
        return
      }

      this.$refs.cannon_ball.style.left = `${this.cannon.ball.x}px`
      this.$refs.cannon_ball.style.top = `${this.cannon.ball.y}px`
    }
  }
}
</script>
