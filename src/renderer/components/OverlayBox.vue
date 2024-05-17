<template>
  <div
    ref="overlay"
    :class="[
      'overlay',
      { 'visible': visible },
    ]"
    @click.stop="(event) => secure ? bounce() : emit('click', event)"
  >
    <div
      ref="content"
      :class="[
        'content',
        { 'enlarge': enlarge }
      ]"
      @click.stop.prevent
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

export interface Properties {
  secure?: boolean
  visible?: boolean
}

withDefaults(defineProps<Properties>(), {
  secure: true,
  visible: false,
})

const emit = defineEmits([
  'click',
])

const ticker = ref<ReturnType<typeof setTimeout>>()
const enlarge = ref(false)

async function bounce () {
  enlarge.value = true
  ticker.value = setTimeout(() => enlarge.value = false, 50)
}

defineExpose({
  enlarge,
})
</script>

<style scoped>
.overlay {
  background: rgba(var(--v-theme-on-background), 0.25);
  justify-content: center;
  align-items: center;
  display: flex;
  height: 100vh;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  opacity: 0;
  pointer-events: none;
  transition: all 0.15s ease-in-out;
  z-index: 100000;
}

.overlay.visible {
  opacity: 1;
  pointer-events: all;
}

.content {
  transform: scale(0.90);
  transition: transform 0.15s ease-in-out;
}

.overlay.visible .content {
  transform: scale(1.00)
}

.overlay.visible .content.enlarge {
  transform: scale(1.10)
}
</style>
