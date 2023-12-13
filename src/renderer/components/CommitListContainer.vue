<template>
  <div
    :class="[
      'container',
      grow ? 'container-grow' : undefined,
    ]"
    :style="{ 'min-height': `${height}px` }"
  >
    <div class="column pr-1">
      <slot name="left" />
    </div>
    <div class="column pl-1">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Props {
  grow?: boolean,
  height?: number,
}

withDefaults(defineProps<Props>(), {
  grow: false,
  height: 0,
})
</script>

<style scoped>
.container {
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  overflow-y: auto;
}

.container-grow {
  flex-grow: 1;
}

.column {
  display: flex;
  flex-direction: column;
  width: 50vw;
}
</style>
