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
export interface Properties {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelValue?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]
}

withDefaults(defineProps<Properties>(), {
  modelValue: undefined,
  items: () => [],
})
</script>
