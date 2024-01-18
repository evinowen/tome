<template>
  <div>
    <slot name="prepend" />
    <slot>
      {{ modelValue ? 'true' : 'false' }}
    </slot>
    <slot name="append" />
  </div>
</template>

<script setup lang="ts">
export interface Properties {
  modelValue?: boolean
}

withDefaults(defineProps<Properties>(), {
  modelValue: false,
})

defineEmits([
  'update:model-value',
])
</script>
