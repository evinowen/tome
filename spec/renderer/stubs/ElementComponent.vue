<template>
  <div ref="element">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const element = ref<HTMLElement>()

defineExpose({
  element,
})
</script>
