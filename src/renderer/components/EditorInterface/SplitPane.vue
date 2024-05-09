<template>
  <div
    :class="[
      'root',
      resizing ? 'resizing' : undefined
    ]"
    :style="{ 'flex-direction': docked === 'left' ? 'row' : 'row-reverse' }"
  >
    <div
      ref="resized"
      class="pane-docked"
      :style="{ width: `${width}px` }"
    >
      <slot name="docked" />
    </div>
    <div
      ref="resizer"
      class="pane-control"
      :style="{ width: `${resize_width}px` }"
      @pointerdown="resize_start"
      @pointermove="throttle_resize_move"
      @pointerup="resize_end"
    >
      <div class="pane-control-fill" />
    </div>

    <div
      class="pane-dynamic"
    >
      <slot name="dynamic" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { throttle } from 'lodash'

interface Properties {
  docked?: string
  docked_width?: number
  resize_width?: number
}

const properties = withDefaults(defineProps<Properties>(), {
  docked: 'left',
  docked_width: 320,
  resize_width: 3,
})

const emit = defineEmits([
  'resize',
])

const resized = ref<HTMLElement>(undefined)

const resizing = ref(false)
const resizer = ref<HTMLElement>()
const origin = ref(0)
const offset = ref(0)
const width = ref(properties.docked_width)

function resize_start (event: PointerEvent) {
  resizer.value.setPointerCapture(event.pointerId)
  resizing.value = true
  width.value = resized.value.offsetWidth
  origin.value = width.value
  offset.value = event.pageX
}

const throttle_resize_move = throttle(resize_move, 25)

function resize_move (event) {
  if (!resizing.value) {
    return
  }

  switch (properties.docked) {
    case 'left':
      width.value = origin.value - offset.value + event.pageX
      break

    case 'right':
      width.value = origin.value + offset.value - event.pageX
      break
  }
}

function resize_end (event: PointerEvent) {
  resizing.value = false
  resizer.value.releasePointerCapture(event.pointerId)
  emit('resize', width.value)
}

watch(() => properties.docked_width, () => width.value = properties.docked_width)

defineExpose({
  offset,
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

.pane-docked {
  height: 100%;
  position: relative;
  flex-shrink: 0;
  min-width: 0;
  min-height: 0;
  transition: width 0.25s ease-in;
  background: rgb(var(--v-theme-background))
}

.root.resizing .pane-docked {
  transition: none;
}

.pane-dynamic {
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
  background: rgb(var(--v-theme-background));
  transition: width 0.25s ease-out;
}

.pane-control-fill {
  width: 100%;
  height: 100%;
  background: rgba(var(--v-theme-on-background), 0.3);
}

.root.resizing .pane-control {
  transition: none;
}
</style>
