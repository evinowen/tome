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
