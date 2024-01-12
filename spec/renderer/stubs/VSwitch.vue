<template>
  <div>
    <slot
      v-if="modelValue"
      name="selection"
      :item="modelValue"
    />
  </div>
</template>

<script setup lang="ts">
export interface Props {
  modelValue?: any,
  items: any[],
}

withDefaults(defineProps<Props>(), {
  items: () => [],
})
</script>
