<template>
  <div>
    <input
      type="text"
      :value="modelValue"
    >
    <slot name="append-outer" />
  </div>
</template>

<script setup lang="ts">
export interface Properties {
  modelValue: string
}

withDefaults(defineProps<Properties>(), {
  modelValue: '',
})

defineEmits([
  'update:model-value',
  'click:append',
])
</script>
