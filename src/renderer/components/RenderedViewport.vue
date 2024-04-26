<!-- eslint-disable vue/no-v-html -->

<template>
  <div
    class="rendered"
    :style="{
      '--font-family-header': theme.font_family_header,
      '--font-size-header': `${theme.font_size_header}em`,
      '--font-family-content': theme.font_family_content,
      '--font-size-content': `${theme.font_size_content}em`,
    }"
    v-html="rendered"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownParser from '@/MarkdownParser'
import { fetchStore } from '@/store'

const store = fetchStore()

interface Properties {
  content: string
}

const properties = withDefaults(defineProps<Properties>(), {
  content: '',
})

const theme = computed(() => {
  return store.state.configuration.dark_mode
    ? store.state.configuration.themes.dark.rendered
    : store.state.configuration.themes.light.rendered
})

const rendered = computed((): string => {
  return MarkdownParser.parse(properties.content)
})
</script>

<style scoped>
.rendered {
  overflow-y: scroll;
  background-color: rgb(var(--v-theme-rendered-background)) !important;
}

.rendered :deep(p) {
  color: rgb(var(--v-theme-rendered-content));
  font-family: var(--font-family-content);
  font-size: var(--font-size-content);
}

.rendered :deep(a) {
  color: rgb(var(--v-theme-rendered-anchor));
}

.rendered :deep(.rendered-header) {
  font-family: var(--font-family-header);
  font-size: var(--font-size-header);
}

.rendered :deep(h1) {
  color: rgb(var(--v-theme-rendered-header-1));
}

.rendered :deep(h2) {
  color: rgb(var(--v-theme-rendered-header-2));
}

.rendered :deep(h3) {
  color: rgb(var(--v-theme-rendered-header-3));
}

.rendered :deep(h4) {
  color: rgb(var(--v-theme-rendered-header-4));
}

.rendered :deep(h5) {
  color: rgb(var(--v-theme-rendered-header-5));
}

.rendered :deep(h6) {
  color: rgb(var(--v-theme-rendered-header-6));
}
</style>
