<template>
  <div class="d-flex align-center">
    <div
      :class="[
        'control',
        value ? 'active' : '',
        inset ? 'inset' : '',
      ]"
      :style="{
        'height': `${height}px`,
        'width': `${width}px`,
      }"
      @click.stop="on_click"
    >
      <div
        v-if="inset"
        class="track"
        :style="{
          'border-radius': `${track_height / 2}px`,
          'height': `${track_height}px`,
          'width': `${track_width}px`,
          'top': `${track_offset_y}px`,
          'left': `${track_offset_x}px`,
        }"
      />
      <div
        v-else
        class="track"
        :style="{
          'border-radius': `${height / 2}px`,
          'height': `${height}px`,
          'width': `${width}px`,
        }"
      />
      <div
        class="transition"
        :style="{
          'transform': `translateX(${value ? transition_offset : 0}px)`,
          'padding': `${padding}px`,
        }"
      >
        <div
          class="thumb"
          :style="{
            'border-radius': `${button_size / 2}px`,
            'height': `${button_size}px`,
            'width': `${button_size}px`,
          }"
        />
      </div>
    </div>
    <div
      v-if="label !== ''"
      class="label"
    >
      {{ label }}
    </div>
  </div>
</template>

<script lang="ts">

</script>

<script setup lang="ts">
import { computed } from 'vue'

export interface Properties {
  value?: boolean
  inset?: boolean
  height?: number
  width?: number
  padding?: number
  label?: string
}

const properties = withDefaults(defineProps<Properties>(), {
  value: false,
  inset: false,
  height: 30,
  width: 50,
  padding: 4,
  label: '',
})

const emit = defineEmits([ 'input' ])

const button_size = computed(() => properties.height - (2 * properties.padding))

const transition_offset = computed(() => properties.width - button_size.value - (2 * properties.padding))

const track_height = computed(() => button_size.value / 2)
const track_width = computed(() => properties.width - (2 * properties.padding) - (button_size.value / 2))

const track_offset_x = computed(() => (properties.width - track_width.value) / 2)
const track_offset_y = computed(() => (properties.height - track_height.value) / 2)

const on_click = () => {
  emit('input', !properties.value)
}
</script>

<style scoped>
* {
  --tome-toggle-switch-transition-speed: 0.35s;
}

.control {
  cursor: pointer;
  overflow: visible;
  position: relative;
  flex-grow: 0;
  flex-shrink: 0;
}

.label {
  margin-left: 6px;
  font-size: 1.2em;
  flex-grow: 1;
  flex-shrink: 0;
}

.track {
  transition: all var(--tome-toggle-switch-transition-speed);
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(var(--v-theme-on-surface), 0.2);
}

.control:hover .track {
  background: rgba(var(--v-theme-on-surface), 0.5);
}

.active .track {
  background: rgba(var(--v-theme-primary), 0.7);
}

.active:hover .track {
  background: rgba(var(--v-theme-primary), 1.0);
}

.transition {
  transition: all var(--tome-toggle-switch-transition-speed);
  overflow: visible;
  position: relative;
}

.thumb {
  background: rgb(var(--v-theme-surface), 0.75);
  position: relative;
  transition: all var(--tome-toggle-switch-transition-speed);
  transform-origin: center;
  transform: scale(0.6);
}

.control:hover .thumb {
  background: rgb(var(--v-theme-surface), 1);
}

.inset .thumb {
  background: rgba(var(--v-theme-surface), 1.0);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.4);
  transform: scale(1.0);
}

.active .thumb,
.active:hover .thumb {
  background: rgba(var(--v-theme-surface), 1.0);
  transform: scale(1.0);
}

.active.inset .thumb {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.4);
}
</style>
