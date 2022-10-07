<template>
  <v-layout style="height: 100%;" @click.stop=click>
    <v-flex ref="sea" grow class="sea">
      <div ref="boat" class="boat">
        <v-icon>mdi-sail-boat</v-icon>
      </div>
      <div ref="cannon_ball" class="cannon_ball">
        <v-icon>
          {{ cannon.ball.sunk ? '' : 'mdi-circle-small' }}
        </v-icon>
      </div>
      <div ref="cannon_splash" :class="['splash', cannon.splash.splashing ? 'splashing' : '' ]">
        <div style="position: relative">
          <v-icon class="splash-outline">
            {{ 'mdi-circle-outline' }}
          </v-icon>
        </div>
      </div>
      <div ref="distance" :class="['distance', cannon.distance.show ? 'visible' : '' ]">
        {{ cannon.distance.value.toFixed(2) }}m
      </div>
    </v-flex>
  </v-layout>
</template>

<style scoped>
.sea {
  position: relative;
  overflow: visible;
  height: 100%;
}
.boat {
  position: absolute;
  bottom: 12px;
  left: 24px;
}

.distance {
  position: absolute;
  text-align: center;
  width: 64px;
  font-size: 9px;
  font-weight: 100;
  opacity: 0.0;
  transition: opacity 1.6s ease-in-out;
}

.visible {
  opacity: 1.0;
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
  display: flex;
  justify-content: center;
  align-content: center;
  width: 18px;
  height: 18px;
  transform: rotateX(60deg);
}

.splash .splash-outline {
  margin: auto;
  transform: scale(0, 0);
}

.splash.splashing .splash-outline {
  position: absolute;
  -webkit-animation: splash 0.5s linear;
}

@-webkit-keyframes splash {
  0% { -webkit-transform: scale(0, 0); }
  30% { -webkit-transform: scale(1, 1); }
  100% { -webkit-transform: scale(0, 0); }
}
</style>

<script lang="ts">
import Vue from 'vue'
import { VLayout, VFlex, VIcon } from 'vuetify/lib'

export default Vue.extend({
  components: { VLayout, VFlex, VIcon },
  data: () => ({
    ticker: null,
    cannon: {
      distance: {
        value: 0,
        show: false,
        x: 0,
        y: 0
      },
      ball: {
        sunk: true,
        x: 0,
        y: 0,
        dx: 0,
        dy: 0
      },
      splash: {
        splashing: false,
        timeout: null,
        x: 0,
        y: 0
      }
    }
  }),
  mounted: function () {
    clearInterval(this.ticker)
    this.ticker = setInterval(() => this.tick(), 50)
  },
  // unmounted: function () {
  //   clearInterval(this.ticker)
  // },
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

      this.cannon.ball.x = boat_rect.left - sea_rect.left + 6
      this.cannon.ball.y = boat_rect.top - sea_rect.top

      const point_x = event.clientX - sea_rect.left
      const point_y = event.clientY - sea_rect.top

      const length = Math.sqrt(point_x * point_x + point_y * point_y)

      const velocity = 5

      this.cannon.ball.dx = velocity * (point_x - this.cannon.ball.x) / length
      this.cannon.ball.dy = velocity * (this.cannon.ball.y - point_y) / length

      this.cannon.ball.sunk = false

      await this.update()
    },
    tick: async function () {
      if (!this.cannon.ball.sunk) {
        this.cannon.ball.dy -= 0.05

        this.cannon.ball.x += this.cannon.ball.dx
        this.cannon.ball.y -= this.cannon.ball.dy

        const sea_rect = this.$refs.sea.getBoundingClientRect()
        const boat_rect = this.$refs.boat.getBoundingClientRect()

        if (this.cannon.ball.y > boat_rect.top - sea_rect.top + 8) {
          this.cannon.ball.sunk = true
          this.cannon.splash.x = this.cannon.ball.x - 9
          this.cannon.splash.y = this.cannon.ball.y
          this.cannon.splash.splashing = true

          if (this.cannon.splash.timeout) {
            clearTimeout(this.cannon.splash.timeout)
            this.cannon.splash.timeout = null
          }

          this.cannon.splash.timeout = setTimeout(() => {
            this.cannon.splash.splashing = false
          }, 1000)

          this.cannon.distance.value = this.cannon.ball.x - (boat_rect.left - sea_rect.left) - 6
          this.cannon.distance.show = true
          this.cannon.distance.x = this.cannon.ball.x
          this.cannon.distance.y = this.cannon.ball.y - 2

          if (this.cannon.distance.timeout) {
            clearTimeout(this.cannon.distance.timeout)
            this.cannon.distance.timeout = null
          }

          this.cannon.distance.timeout = setTimeout(() => {
            this.cannon.distance.show = false
          }, 1200)
        }
      }

      await this.update()
    },
    update: async function () {
      this.update_cannon_ball()
      this.update_splash()
      this.update_distance()
    },
    update_cannon_ball: async function () {
      if (!this.$refs.cannon_ball) {
        return
      }

      if (this.cannon.ball.sunk) {
        return
      }

      this.$refs.cannon_ball.style.left = `${this.cannon.ball.x}px`
      this.$refs.cannon_ball.style.top = `${this.cannon.ball.y}px`
    },
    update_splash: async function () {
      if (!this.$refs.cannon_splash) {
        return
      }

      this.$refs.cannon_splash.style.left = `${this.cannon.splash.x}px`
      this.$refs.cannon_splash.style.top = `${this.cannon.splash.y + 2}px`
    },
    update_distance: async function () {
      if (!this.cannon.distance.value) {
        return
      }

      this.cannon.distance.y = this.cannon.distance.y - 1

      this.$refs.distance.style.left = `${this.cannon.distance.x - 32}px`
      this.$refs.distance.style.top = `${this.cannon.distance.y - 3}px`
    }
  }
})
</script>