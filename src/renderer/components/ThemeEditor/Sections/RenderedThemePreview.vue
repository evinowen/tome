<template>
  <theme-provider :theme="theme">
    <rendered-viewport
      class="pa-4"
      style="height: 320px"
      type="markdown"
      :content="ExampleMarkdown"
    />
  </theme-provider>
</template>

<script setup lang="ts">
import RenderedViewport from '@/components/RenderedViewport.vue'
import ThemeProvider from '@/components/ThemeProvider.vue'

import ExampleMarkdown from './Content/Example.md?raw'

export interface Properties {
  theme: string
}

withDefaults(defineProps<Properties>(), {
  theme: 'light',
})
</script>
