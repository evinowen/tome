<template>
  <div>
    <slot
      v-if="modelValue"
      name="selection"
      :item="modelValue"
    />
    <slot
      v-for="item in items"
      name="item"
      :item="item"
    />
    <slot name="append" />
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
