<template>
  <div
    ref="draggable"
    class="explorer-node-pickup"
    droppable
    :draggable="enabled"
    @dragstart.stop="start"
    @dragend.stop="end"
    @dragenter.stop="enter"
    @dragover.prevent.stop
    @dragleave.stop="leave"
    @drop.stop="drop"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { fetchStore } from '@/store'

export interface Properties {
  path: string
  enabled: boolean
}

const properties = withDefaults(defineProps<Properties>(), {
  enabled: false,
})

const store = fetchStore()

async function start (event) {
  if (!properties.enabled) {
    event.preventDefault()
    return
  }

  event.dataTransfer.dropEffect = 'move'
  event.target.style.opacity = 0.2

  await store.dispatch('files/drag', properties.path)
}

function end (event) {
  event.target.style.opacity = 1
}

function enter (event) {
  const container = event.target.closest('[droppable]')
  container.classList.add('explorer-node-drop')
}

function leave (event) {
  const container = event.target.closest('[droppable]')
  container.classList.remove('explorer-node-drop')
}

async function drop (event) {
  leave(event)
  await store.dispatch('files/drop', properties.path)
}

defineExpose({
  start,
  end,
  enter,
  leave,
  drop,
})
</script>

<style scoped>
.explorer-node-pickup.explorer-node-drop {
  background: rgba(var(--v-theme-secondary), 0.2)
}
</style>
