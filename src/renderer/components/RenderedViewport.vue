<!-- eslint-disable vue/no-v-html -->
<template>
  <div
    ref="element"
    :class="[
      'rendered',
      `rendered-${type}`,
    ]"
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
import { computed, onMounted, ref, watchEffect } from 'vue'
import Mark from 'mark.js'
import MarkdownParser from '@/objects/parsers/MarkdownParser'
import PlainTextParser from '@/objects/parsers/PlainTextParser'
import CSVParser from '@/objects/parsers/CSVParser'
import { fetch_configuration_store } from '@/store/modules/configuration'

const configuration = fetch_configuration_store()
const element = ref<HTMLElement>()

let mark: Mark

interface Properties {
  directory?: string
  path?: string
  type: string
  content: string
}

const properties = withDefaults(defineProps<Properties>(), {
  directory: '',
  path: '',
  type: '',
  content: '',
})

onMounted(() => {
  mark = new Mark(element.value)
})

const theme = computed(() => {
  return configuration.dark_mode
    ? configuration.themes.dark.rendered
    : configuration.themes.light.rendered
})

const rendered = ref<string>()
watchEffect(async () => {
  switch (properties.type) {
    case 'markdown':
      return rendered.value = await MarkdownParser.parse(properties.content, properties.directory)

    case 'csv':
      return rendered.value = CSVParser.parse(properties.content)

    case 'html':
      return rendered.value = `<iframe style="border: none; width: 100%; min-height: 100%;" src="${properties.path}"></iframe>`

    default:
      return rendered.value = PlainTextParser.parse(properties.content)
  }
})

const selection = {
  results: [] as Element[],
  target: undefined as Element,

  class: {
    result: 'highlight-rendered',
    target: 'highlight-rendered-target',
  },

  clear: () => new Promise((resolve) => {
    mark.unmark({ done: resolve })
  }),

  highlight: async (regex: RegExp) => {
    const total = new Promise((resolve) => {
      mark.markRegExp(
        regex,
        {
          className: selection.class.result,
          acrossElements: false,
          done: (total) => {
            resolve(total)
          },
        },
      )
    })

    selection.results = [ ...element.value.querySelectorAll(`.${selection.class.result}`) ]

    return total
  },

  focus: async (index) => {
    if (selection.target) {
      selection.target.classList.remove(selection.class.target)
    }

    selection.target = selection.results[index]

    if (selection.target) {
      selection.target.classList.add(selection.class.target)
      selection.target.scrollIntoView()
    }
  },
}

defineExpose({
  selection,
})
</script>

<style scoped>
.rendered {
  height: 100%;
  width: 100%;
  padding: 12px;
  overflow-y: scroll;
  background-color: rgb(var(--v-theme-rendered-background)) !important;
}

.rendered-html {
  overflow-y: hidden;
  padding: 0px;
}

.rendered :deep(*) {
  padding: revert;
  margin: revert;
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

.rendered :deep(::selection) {
  background-color: rgba(var(--v-theme-rendered-selection), 0.6) !important;
  outline: 2px solid rgba(var(--v-theme-rendered-selection), 0.6);
  color: rgb(var(--v-theme-on-rendered-selection));
}

.rendered :deep(.highlight-rendered) {
  background-color: rgba(var(--v-theme-rendered-highlight), 0.6) !important;
  outline: 2px solid rgba(var(--v-theme-rendered-highlight), 0.6);
  color: rgb(var(--v-theme-on-rendered-highlight));
}

.rendered :deep(.highlight-rendered-target) {
  background-color: rgb(var(--v-theme-rendered-highlight-focus)) !important;
  outline: 2px solid rgb(var(--v-theme-rendered-highlight-focus));
  color: rgb(var(--v-theme-on-rendered-highlight-focus));
}
</style>
