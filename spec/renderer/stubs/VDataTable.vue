<template>
  <div>
    <slot name="headers" />
    <slot
      name="item"
      v-for="(item, index) in items"
      :item="item"
      :index="index"
    >
      <slot v-for="header in headers" :name="`item.${header.value}`" :item="item" />
    </slot>
    <slot name="bottom" />
  </div>
</template>

<script setup lang="ts">
export interface Props {
  headers: { value: string, [key: string]: any }[],
  items: any[],
}

withDefaults(defineProps<Props>(), {
  headers: () => [],
  items: () => [],
})
</script>