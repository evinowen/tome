<template>
  <div
    ref="draggable"
    class="explorer-node-pickup"
    droppable
    :draggable="enabled"
    @dragstart.stop="Drag.start"
    @dragend.stop="Drag.end"
    @dragenter.stop="Drag.enter"
    @dragover.prevent.stop
    @dragleave.stop="Drag.leave"
    @drop.stop="Drag.drop"
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

class Drag {
  static async start (event) {
    if (!properties.enabled) {
      event.preventDefault()
      return
    }

    event.dataTransfer.dropEffect = 'move'
    event.target.style.opacity = 0.2

    await store.dispatch('files/drag', properties.path)
  }

  static end (event) {
    event.target.style.opacity = 1
  }

  static enter (event) {
    const container = event.target.closest('[droppable]')
    container.classList.add('explorer-node-drop')
  }

  static leave (event) {
    const container = event.target.closest('[droppable]')
    container.classList.remove('explorer-node-drop')
  }

  static async drop (event) {
    Drag.leave(event)
    await store.dispatch('files/drop', properties.path)
  }
}

defineExpose({
  Drag,
})
</script>

<style scoped>
.explorer-node-pickup.explorer-node-drop {
  background: rgba(var(--v-theme-secondary), 0.2)
}
</style>
