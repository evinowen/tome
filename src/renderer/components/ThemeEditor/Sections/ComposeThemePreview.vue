<!-- eslint-disable vue/no-v-html -->

<template>
  <div>
    <theme-provider :theme="theme">
      <v-sheet
        color="background"
        style="height: 320px"
      >
        <div
          ref="root"
          class="root"
        />
      </v-sheet>
    </theme-provider>
    <v-select
      v-model="language"
      class="mt-3"
      density="compact"
      :items="['markdown', 'javascript', 'html']"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { syntaxHighlighting } from '@codemirror/language'
import { Compartment, Extension } from '@codemirror/state'
import { EditorView, lineNumbers } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import EditorTheme from '@/composer/EditorTheme'
import HighlightStyleDefinition from '@/composer/HighlightStyleDefinition'
import ThemeProvider from '@/components/ThemeProvider.vue'
import {
  VSheet,
  VSelect,
} from 'vuetify/components'

import ExampleMarkdown from './Content/Example.md?raw'
import ExampleJavaScript from './Content/Example.js?raw'
import ExampleHTML from './Content/Example.html?raw'

export interface Properties {
  theme: string
}

withDefaults(defineProps<Properties>(), {
  theme: 'light',
})

const configuration = fetch_configuration_store()
const language = ref('markdown')

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
  return configuration[configuration.target].line_numbers
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

defineExpose({
  language,
  content,
  compartments,
})
</script>

<style scoped>
.root,
.root :deep(.cm-editor) {
  height: 100%;
  width: 100%;
}
</style>
