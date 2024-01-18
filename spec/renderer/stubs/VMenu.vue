<template>
  <div>
    <slot name="activator" />
    <slot v-if="modelValue" />
  </div>
</template>

<script setup lang="ts">
export interface Properties {
  modelValue: boolean
}

withDefaults(defineProps<Properties>(), {
  modelValue: false,
})
</script>
