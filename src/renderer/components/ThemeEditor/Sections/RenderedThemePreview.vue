<!-- eslint-disable vue/no-v-html -->

<template>
  <rendered-viewport
    class="pa-4"
    style="height: 320px"
    :content="ExampleMarkdown"
  />
</template>

<script lang="ts">
import RenderedViewport from '@/components/RenderedViewport.vue'

export default {
  components: {
    RenderedViewport,
  },
}
</script>

<script setup lang="ts">
import ExampleMarkdown from './Content/Example.md?raw'
</script>
