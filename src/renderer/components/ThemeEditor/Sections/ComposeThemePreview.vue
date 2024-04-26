<!-- eslint-disable vue/no-v-html -->

<template>
  <div>
    <v-sheet
      color="background"
      style="height: 320px"
    >
      <div
        ref="root"
        class="root"
        :style="{
          '--font-family': theme.font_family_editor || 'monospace',
          '--font-size': `${theme.font_size_editor || 1}em`,
        }"
      />
    </v-sheet>
    <v-select
      v-model="language"
      class="mt-1"
      density="compact"
      :items="['markdown', 'javascript', 'html']"
    />
  </div>
</template>

<script lang="ts">
import {
  VSheet,
  VSelect,
} from 'vuetify/components'

export default {
  components: {
    VSheet,
    VSelect,
  },
}
</script>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { fetchStore } from '@/store'
import { tags } from '@lezer/highlight'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { Compartment, Extension } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'

import ExampleMarkdown from './Content/Example.md?raw'
import ExampleJavaScript from './Content/Example.js?raw'
import ExampleHTML from './Content/Example.html?raw'

const store = fetchStore()
const language = ref('markdown')

const theme = computed(() => {
  return store.state.configuration.dark_mode
    ? store.state.configuration.themes.dark.compose
    : store.state.configuration.themes.light.compose
})

const syntax_definition = computed(() => [
  { tag: tags.heading1, color: theme.value.header_1, textDecoration: 'underline' },
  { tag: tags.heading2, color: theme.value.header_2, textDecoration: 'underline' },
  { tag: tags.heading3, color: theme.value.header_3, textDecoration: 'underline' },
  { tag: tags.heading4, color: theme.value.header_4, textDecoration: 'underline' },
  { tag: tags.heading5, color: theme.value.header_5, textDecoration: 'underline' },
  { tag: tags.heading6, color: theme.value.header_6, textDecoration: 'underline' },
  { tag: tags.content, color: theme.value.content },
  { tag: tags.link, color: theme.value.anchor, textDecoration: 'underline' },
])

const content = computed(() => {
  switch (language.value) {
    case 'markdown':
      return ExampleMarkdown
    case 'javascript':
      return ExampleJavaScript
    case 'html':
      return ExampleHTML
    default:
      return ''
  }
})

const root = ref<HTMLElement>(undefined)
let view: EditorView

const theme_light_mode: Extension = EditorView.baseTheme({
  '.highlight': {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    outline: '2px solid rgba(255, 0, 0, 0.2)',
  },
  '.highlight-target': {
    backgroundColor: 'rgba(255, 0, 0, 0.4)',
    outline: '2px solid rgba(255, 0, 0, 0.4)',
  },
})

interface Compartments {
  syntax: Compartment
  language: Compartment
  line_numbers: Compartment
  tabs: Compartment
  theme: Compartment
}

const compartments: Compartments = {
  syntax: new Compartment(),
  language: new Compartment(),
  line_numbers: new Compartment(),
  tabs: new Compartment(),
  theme: new Compartment(),
}

onMounted(() => {
  view = new EditorView({
    extensions: [
      compartments.syntax.of([]),
      compartments.language.of(markdown()),
      compartments.line_numbers.of(lineNumbers()),
      compartments.theme.of(theme_light_mode),
    ],
    parent: root.value,
  })

  refresh_syntax_definition()
  refresh_content()
})

watch(syntax_definition, refresh_syntax_definition)
function refresh_syntax_definition () {
  const extension = syntaxHighlighting(HighlightStyle.define(syntax_definition.value))

  view.dispatch({
    effects: [ compartments.syntax.reconfigure(extension) ],
  })
}

watch(content, refresh_content)
function refresh_content () {
  let extension: Extension = []
  switch (language.value) {
    case 'markdown':
      extension = markdown()
      break

    case 'javascript':
      extension = javascript()
      break

    case 'html':
      extension = html()
      break
  }

  view.dispatch({
    effects: [ compartments.language.reconfigure(extension) ],
  })

  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: content.value,
    },
  })
}
</script>

<style scoped>
.root,
.root :deep(.cm-editor) {
  height: 100%;
  width: 100%;
  background-color: rgb(var(--v-theme-compose-background));
  font-family: var(--font-family);
  font-size: var(--font-size);
}

.root :deep(.cm-scroller) {
  font-family: var(--font-family);
  font-size: var(--font-size);
}

.root :deep(.cm-gutters) {
  font-family: var(--font-family);
  font-size: var(--font-size);
  background-color: rgb(var(--v-theme-compose-gutters));
  color: rgb(var(--v-theme-compose-line-numbers));
}
</style>
