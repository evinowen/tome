<template>
  <div>
    <slot name="append-outer" />
    <input
      type="text"
      :value="modelValue"
    />
  </div>
</template>

<script setup lang="ts">
export interface Props {
  modelValue: string,
}

withDefaults(defineProps<Props>(), {
  modelValue: '',
})

const emit = defineEmits([
  'update:model-value'
])
</script>
