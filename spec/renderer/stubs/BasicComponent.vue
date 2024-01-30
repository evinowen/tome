<template>
  <div>
    <slot name="prepend" />
    <slot>
      {{ modelValue }}
    </slot>
    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
export interface Properties {
  modelValue?: string
}

withDefaults(defineProps<Properties>(), {
  modelValue: '',
})

defineEmits([
  'click',
  'update:model-value',
])
</script>
