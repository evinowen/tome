<template>
  <div class="d-flex key-border align-center">
    <div class="flex-shrink-0 pa-1 mr-2">
      <div
        class="d-flex justify-center"
        style="min-width: 160px"
      >
        <slot />
      </div>
    </div>
    <div class="flex-shrink-0 pa-1">
      <strong>{{ label }}</strong>
    </div>
    <div class="flex-grow-1 pa-1">
      {{ detail }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Properties {
  label: string
  detail: string
}

withDefaults(defineProps<Properties>(), {
  label: '',
  detail: '',
})
</script>
