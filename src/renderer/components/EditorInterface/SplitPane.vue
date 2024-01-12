<template>
  <div
    :class="[
      'root',
      resizing ? 'resizing' : undefined
    ]"
    @mousemove="resize_move"
    @mouseup="resize_end"
    @mouseleave="resize_end"
  >
    <div
      ref="resized"
      class="pane-left"
      :style="{ width: `${width}px` }"
    >
      <slot name="left" />
    </div>
    <div
      class="pane-control"
      @mousedown="resize_start"
    />
    <div class="pane-right">
      <slot name="right" />
    </div>
  </div>
</template>

<script lang="ts">

export default {}
</script>

<script setup lang="ts">
import { ref } from 'vue'

const resized = ref<HTMLElement>(null)

const resizing = ref(false)
const origin = ref(0)
const width = ref(240)

function resize_start (event) {
  resizing.value = true
  width.value = resized.value.offsetWidth
  origin.value = event.pageX
}

function resize_move (event) {
  if (!resizing.value) {
    return
  }

  width.value += event.pageX - origin.value
  origin.value = event.pageX
}

function resize_end () {
  resizing.value = false
}

defineExpose({
  origin,
  resize_end,
  resize_move,
  resize_start,
  resized,
  resizing,
  width,
})
</script>

<style scoped>
.root {
  width: 100%;
  height: 100%;
  display: flex;
}

.root.resizing {
  cursor: ew-resize;
}

.pane-left {
  height: 100%;
  position: relative;
  flex-shrink: 0;
  min-width: 0;
  min-height: 0;
}

.pane-right {
  height: 100%;
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;
  min-height: 0;
  position: relative;
}

.pane-control {
  flex-grow: 0;
  flex-shrink: 0;
  width: 2px;
  cursor: ew-resize;
  background: rgba(var(--v-theme-on-background), 0.3);
}
</style>
