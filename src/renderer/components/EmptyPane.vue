<template>
  <div class="root">
    <div class="content pa-2">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Properties {
  error?: string
}

withDefaults(defineProps<Properties>(), {
  error: '',
})
</script>

<style scoped>
.root {
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.content {
  width: 100%;
}
</style>
