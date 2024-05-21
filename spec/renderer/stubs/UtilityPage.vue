<template>
  <div>
    <slot />
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
export interface Properties {
  open?: boolean
}

withDefaults(defineProps<Properties>(), {
  open: true,
})

defineEmits([
  'close',
])
</script>
