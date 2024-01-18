<template>
  <div>
    <slot name="headers" />
    <slot
      v-for="(item, index) in items"
      name="item"
      :item="item"
      :index="index"
    >
      <slot
        v-for="header in headers"
        :name="`item.${header.value}`"
        :item="item"
      />
    </slot>
    <slot name="bottom" />
  </div>
</template>

<script setup lang="ts">
export interface Properties {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers: { value: string, [key: string]: any }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]
}

withDefaults(defineProps<Properties>(), {
  headers: () => [],
  items: () => [],
})
</script>
