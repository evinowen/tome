<template>
  <div>
    <slot />
    <slot name="actions" />
    <slot name="overlays" />
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
