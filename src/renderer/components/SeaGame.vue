<template>
  <div
    style="height: 100%; overflow: visible;"
  >
    <div class="pa-0 sea grow">
      <div
        ref="sea"
        class="sea"
        @click.stop="click"
      >
        <div
          ref="boat"
          class="boat"
        >
          <v-icon>mdi-sail-boat</v-icon>
        </div>
        <div
          ref="cannon_ball"
          class="cannon_ball"
        >
          <v-icon>
            {{ cannon.ball.sunk ? '' : 'mdi-circle-small' }}
          </v-icon>
        </div>
        <div
          ref="cannon_splash"
          :class="['splash', cannon.splash.splashing ? 'splashing' : '' ]"
        >
          <div style="position: relative">
            <v-icon class="splash-outline">
              {{ 'mdi-circle-outline' }}
            </v-icon>
          </div>
        </div>
        <div
          ref="distance"
          :class="['distance', cannon.distance.show.value ? 'visible' : '' ]"
        >
          {{ cannon.distance.value.toFixed(2) }}m
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  VCol,
  VIcon,
  VLayout,
} from 'vuetify/components'

export default {
  components: {
    VCol,
    VIcon,
    VLayout,
  }
}
</script>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, reactive } from 'vue'

const boat = ref<HTMLElement>(null)
const cannon_ball = ref<HTMLElement>(null)
const cannon_splash = ref<HTMLElement>(null)
const distance = ref<HTMLElement>(null)
const sea = ref<HTMLElement>(null)

const ticker = ref<number>(0)
const cannon = reactive({
  distance: {
    value: ref(0),
    show: {
      timeout: ref(0),
      value: ref(false),
    },
    move: {
      timeout: ref(0),
      value: ref(false),
    },
    x: ref(0),
    y: ref(0),
  },
  ball: {
    sunk: ref(true),
    x: ref(0),
    y: ref(0),
    dx: ref(0),
    dy: ref(0),
  },
  splash: {
    splashing: ref(false),
    timeout: ref(0),
    x: ref(0),
    y: ref(0),
  }
})

onMounted(() => {
  clearInterval(ticker.value)
  ticker.value = setInterval(() => tick(), 50)
})

onUnmounted(() => {
  clearInterval(ticker.value)
})

async function click (event) {
  if (!sea.value) {
    return
  }

  if (!boat.value) {
    return
  }

  if (!cannon.ball.sunk) {
    return
  }

  const sea_rect = sea.value.getBoundingClientRect()
  const boat_rect = boat.value.getBoundingClientRect()

  cannon.ball.x = boat_rect.left - sea_rect.left + 6
  cannon.ball.y = boat_rect.top - sea_rect.top

  const point_x = event.clientX - sea_rect.left
  const point_y = event.clientY - sea_rect.top

  const length = Math.sqrt(point_x * point_x + point_y * point_y)

  const velocity = 5

  cannon.ball.dx = velocity * (point_x - cannon.ball.x) / length
  cannon.ball.dy = velocity * (cannon.ball.y - point_y) / length

  cannon.ball.sunk = false

  await update()
}

async function tick () {
  if (!cannon.ball.sunk) {
    cannon.ball.dy -= 0.05

    cannon.ball.x += cannon.ball.dx
    cannon.ball.y -= cannon.ball.dy

    const sea_rect = sea.value.getBoundingClientRect()
    const boat_rect = boat.value.getBoundingClientRect()

    if (cannon.ball.y > boat_rect.top - sea_rect.top + 8) {
      cannon.ball.sunk = true
      cannon.splash.x = cannon.ball.x - 9
      cannon.splash.y = cannon.ball.y
      cannon.splash.splashing = true

      if (cannon.splash.timeout) {
        clearTimeout(cannon.splash.timeout)
        cannon.splash.timeout = 0
      }

      cannon.splash.timeout = setTimeout(() => {
        cannon.splash.splashing = false
      }, 1000)

      cannon.distance.value = cannon.ball.x - (boat_rect.left - sea_rect.left) - 6
      cannon.distance.show.value = true
      cannon.distance.move.value = true
      cannon.distance.x = cannon.ball.x
      cannon.distance.y = cannon.ball.y - 2

      if (cannon.distance.show.timeout) {
        clearTimeout(cannon.distance.show.timeout)
        cannon.distance.show.timeout = 0
      }

      if (cannon.distance.move.timeout) {
        clearTimeout(cannon.distance.move.timeout)
        cannon.distance.move.timeout = 0
      }

      cannon.distance.show.timeout = setTimeout(() => {
        cannon.distance.show.value = false
        cannon.distance.move.timeout = setTimeout(() => {
          cannon.distance.move.value = false
        }, 1600)
      }, 1200)
    }
  }

  await update()
}

async function update () {
  update_cannon_ball()
  update_splash()
  update_distance()
}

async function update_cannon_ball () {
  if (!cannon_ball.value) {
    return
  }

  if (cannon.ball.sunk) {
    return
  }

  cannon_ball.value.style.left = `${cannon.ball.x}px`
  cannon_ball.value.style.top = `${cannon.ball.y}px`
}

async function update_splash () {
  if (!cannon_splash.value) {
    return
  }

  cannon_splash.value.style.left = `${cannon.splash.x}px`
  cannon_splash.value.style.top = `${cannon.splash.y + 2}px`
}

async function update_distance () {
  if (!cannon.distance || !cannon.distance.move.value) {
    return
  }

  cannon.distance.y = cannon.distance.y - 1

  distance.value.style.left = `${cannon.distance.x - 32}px`
  distance.value.style.top = `${cannon.distance.y - 3}px`
}
</script>

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
  bottom: 0;
  left: 0;
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
  animation: splash 0.5s linear;
}

@keyframes splash {
  0% { transform: scale(0, 0); }
  30% { transform: scale(1, 1); }
  100% { transform: scale(0, 0); }
}
</style>
