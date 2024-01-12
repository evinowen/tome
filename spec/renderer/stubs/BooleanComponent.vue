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
export interface Props {
  modelValue?: boolean,
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
})

const emit = defineEmits([
  'update:model-value',
])
</script>
