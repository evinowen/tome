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
export interface Props {
  modelValue?: string,
}

withDefaults(defineProps<Props>(), {
  modelValue: ''
})

const emit = defineEmits([
  'click',
  'update:model-value',
])
</script>
