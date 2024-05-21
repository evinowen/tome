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
import { onUnmounted, watch, ref } from 'vue'
import { VIcon } from 'vuetify/components'
import { fetchStore } from '@/store'

const store = fetchStore()
const ticker = ref<ReturnType<typeof setTimeout>>()

const visible = ref<boolean>(false)
const position_x = ref<number>(0)
const position_y = ref<number>(0)

onUnmounted(() => {
  if (ticker.value) {
    clearInterval(ticker.value)
  }
})

watch(() => store.state.validation.visible, (value) => {
  if (ticker.value) {
    clearInterval(ticker.value)
  }

  if (value) {
    ticker.value = setInterval(() => tick(), 50)
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

defineExpose({
  ticker,
  visible,
})
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
