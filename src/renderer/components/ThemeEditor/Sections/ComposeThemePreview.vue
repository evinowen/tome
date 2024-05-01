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
          '--font-family-compose': theme.font_family_compose || 'monospace',
          '--font-size-compose': `${theme.font_size_compose || 1}em`,
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
import { syntaxHighlighting } from '@codemirror/language'
import { Compartment, Extension } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import EditorTheme from '@/composer/EditorTheme'
import HighlightStyleDefinition from '@/composer/HighlightStyleDefinition'

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
      compartments.syntax.of(syntaxHighlighting(HighlightStyleDefinition)),
      compartments.language.of([]),
      compartments.line_numbers.of([]),
      compartments.theme.of(EditorTheme),
    ],
    parent: root.value,
  })

  configure_line_numbers()
  configure_content()
})

const line_numbers = computed((): boolean => {
  return store.state.configuration.line_numbers
})

watch(line_numbers, configure_line_numbers)
function configure_line_numbers () {
  view.dispatch({
    effects: compartments.line_numbers.reconfigure(line_numbers.value ? lineNumbers() : []),
  })
}

watch(content, configure_content)
function configure_content () {
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
}
</style>