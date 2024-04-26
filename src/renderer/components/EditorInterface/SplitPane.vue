<template>
  <div
    :class="[
      'root',
      resizing ? 'resizing' : undefined
    ]"
    :style="{ 'flex-direction': docked === 'left' ? 'row' : 'row-reverse' }"
    @mousemove="debounce_resize_move"
    @mouseup="resize_end"
    @mouseleave="resize_end"
  >
    <div
      ref="resized"
      class="pane-docked"
      :style="{ width: `${width}px` }"
    >
      <slot name="docked" />
    </div>
    <div
      class="pane-control"
      @mousedown="resize_start"
    />

    <div
      class="pane-dynamic"
    >
      <slot name="dynamic" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { debounce } from 'lodash'

interface Properties {
  docked: string
  docked_width: number
}

const properties = withDefaults(defineProps<Properties>(), {
  docked: 'left',
  docked_width: 320,
})

const emit = defineEmits([
  'resize',
])

const resized = ref<HTMLElement>(undefined)

const resizing = ref(false)
const origin = ref(0)
const width = ref(properties.docked_width)

function resize_start (event) {
  resizing.value = true
  width.value = resized.value.offsetWidth
  origin.value = event.pageX
}

const debounce_resize_move = debounce(resize_move, 2)

function resize_move (event) {
  if (!resizing.value) {
    return
  }

  switch (properties.docked) {
    case 'left':
      width.value += event.pageX - origin.value
      break

    case 'right':
      width.value -= event.pageX - origin.value
      break
  }
  origin.value = event.pageX
}

function resize_end () {
  resizing.value = false
  emit('resize', width.value)
}

watch(() => properties.docked_width, () => width.value = properties.docked_width)

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

.pane-docked {
  height: 100%;
  position: relative;
  flex-shrink: 0;
  min-width: 0;
  min-height: 0;
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
  background: rgba(var(--v-theme-on-background), 0.3);
}
</style>
