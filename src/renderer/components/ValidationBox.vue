<template>
  <div
    v-show="visible"
    class="error"
    :style="{
      top: `${position_y}px`,
      left: `${position_x}px`,
    }"
  >
    <v-icon>
      mdi-alert-circle
    </v-icon>
    {{ store.state.validation.message }}
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { VIcon } from 'vuetify/components'
import { fetchStore } from '@/store'

export interface Properties {
  error?: string
}

withDefaults(defineProps<Properties>(), {
  error: 'TEST',
})

const store = fetchStore()
let ticker = 0

const visible = ref<boolean>(false)
const position_x = ref<number>(0)
const position_y = ref<number>(0)

onMounted(() => {
  clearInterval(ticker)
})

onUnmounted(() => {
  clearInterval(ticker)
})

watch(() => store.state.validation.visible, (value) => {
  if (ticker > 0) {
    clearInterval(ticker)
  }

  if (value) {
    ticker = setInterval(() => tick(), 50)
  } else {
    visible.value = false
  }
})

function tick () {
  const rect = store.state.validation.element.getBoundingClientRect()
  visible.value = true
  position_x.value = rect.x
  position_y.value = rect.y
}
</script>

<style scoped>
.error {
  display: fixed;
  top: 20px;
  font-size: 0.8em;
  padding: 4px 8px 4px 4px;
  position: absolute;
  background: rgba(var(--v-theme-error), 0.9);
  color: rgb(var(--v-theme-on-error));
  width: auto;
  z-index: 1000;
}
</style>
