<template>
  <div>
    <slot name="activator" />
    <slot v-if="modelValue" />
  </div>
</template>

<script setup lang="ts">
export interface Props {
  modelValue: boolean,
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
})
</script>