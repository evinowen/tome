<template>
  <div
    ref="root"
    class="root"
    :style="{
      '--font-family': theme.font_family_editor || 'monospace',
      '--font-size': `${theme.font_size_editor || 1}em`,
    }"
    @contextmenu="contextmenu"
  />
</template>

<script lang="ts">

export default {}
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { fetchStore, File } from '@/store'
import { tags } from '@lezer/highlight'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { Compartment, EditorSelection, Extension, RangeSetBuilder, EditorState } from '@codemirror/state'
import { SearchCursor, RegExpCursor } from '@codemirror/search'
import { Decoration, EditorView, keymap, lineNumbers, ViewPlugin } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { javascript } from '@codemirror/lang-javascript'
import { debounce } from 'lodash'

const store = fetchStore()

interface Properties {
  file?: File
}

const properties = withDefaults(defineProps<Properties>(), {
  file: undefined,
})

const root = ref<HTMLElement>(undefined)

interface Compartments {
  syntax: Compartment
  language: Compartment
  line_numbers: Compartment
  tabs: Compartment
  theme: Compartment
  search: Compartment
  search_target: Compartment
}

const compartments: Compartments = {
  syntax: new Compartment(),
  language: new Compartment(),
  line_numbers: new Compartment(),
  tabs: new Compartment(),
  theme: new Compartment(),
  search: new Compartment(),
  search_target: new Compartment(),
}

const search_decoration: Decoration = Decoration.mark({ class: 'highlight' })
const search_decoration_target: Decoration = Decoration.mark({ class: 'highlight-target' })

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

const updated = ref(0)
let view: EditorView

const line_numbers = computed((): boolean => {
  return store.state.configuration.dark_mode
})

const dark_mode = computed((): boolean => {
  return store.state.configuration.dark_mode
})

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

const search = computed(() => {
  return store.state.search
})

const search_state = computed(() => {
  return [
    search.value.query,
    search.value.regex_query,
    search.value.case_sensitive,
    search.value.navigation.target,
  ]
})

watch(line_numbers, configure_line_numbers)
function configure_line_numbers () {
  view.dispatch({
    effects: compartments.line_numbers.reconfigure(line_numbers.value ? lineNumbers() : []),
  })
}

watch(syntax_definition, configure_syntax_definition)
function configure_syntax_definition () {
  const extension = syntaxHighlighting(HighlightStyle.define(syntax_definition.value))

  view.dispatch({
    effects: [ compartments.syntax.reconfigure(extension) ],
  })
}

watch(() => properties.file, load)

const actions = computed(() => {
  return store.state.actions.options.map((name) => ({
    title: name,
    action: async () => {
      const selection = selection_fetch()
      const output = await store.dispatch('actions/execute', { name, target: properties.file.path, selection })

      selection_replace(output || selection)

      await input()
    },
  }))
})

const context = computed(() => {
  return [
    {
      title: 'Action',
      load: () => actions.value,
    },
    { divider: true },
    {
      title: 'Cut',
      active: () => !properties.file.readonly,
      action: async () => {
        const selection = selection_fetch()

        await store.dispatch('clipboard/text', selection)
        selection_replace('')
      },
    },
    {
      title: 'Copy',
      action: async () => {
        const selection = selection_fetch()

        await store.dispatch('clipboard/text', selection)
      },
    },
    {
      title: 'Paste',
      active: () => !properties.file.readonly,
      action: async () => {
        const clipboard = await store.dispatch('clipboard/text')
        selection_replace(clipboard)
      },
    },
  ]
})

async function contextmenu (event) {
  const position = {
    x: event.clientX,
    y: event.clientY,
  }

  await store.dispatch('context/open', { items: context.value, position })
}

onMounted(() => {
  const detect_update = ViewPlugin.define(
    () => ({
      update: (update) => {
        if (!update.docChanged) {
          return
        }

        updated.value++
      },
    }),
  )

  view = new EditorView({
    extensions: [
      detect_update,
      history(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab,
      ]),
      compartments.syntax.of([]),
      compartments.language.of([]),
      compartments.line_numbers.of([]),
      compartments.theme.of([]),
      compartments.search.of([]),
      compartments.search_target.of([]),
    ],
    parent: root.value,
  })

  configure_line_numbers()
  configure_syntax_definition()
  select()

  load(properties.file)
})

function load (file?: File) {
  if (!file) {
    return
  }

  let language: Extension
  switch (file.extension) {
    case '.md':
      language = markdown()
      break

    case '.js':
    case '.json':
      language = javascript()
      break
  }

  view.dispatch({
    effects: compartments.language.reconfigure(language ?? []),
  })

  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: file.document.content,
    },
  })
}

function selection_fetch () {
  let value = ''
  const selection = view.state.selection
  if (selection !== undefined) {
    for (const range of selection.ranges) {
      value += view.state.doc.slice(range.from, range.to)
    }
  }

  return value
}

function selection_replace (value) {
  view.dispatch(view.state.replaceSelection(value))
}

function search_cursor (text, from, to) {
  const { query, regex_query, case_sensitive } = search.value
  return regex_query
    ? new RegExpCursor(text, query, { ignoreCase: !case_sensitive }, from, to)
    : new SearchCursor(text, query, from, to, case_sensitive ? undefined : (x) => x.toLowerCase())
}

watch(search_state, select)
async function select () {
  if (!properties.file) {
    return
  }

  if (search.value.query.length === 0) {
    await store.dispatch('search/navigate', { total: 0, target: 0 })

    view.dispatch({
      effects: [
        compartments.search.reconfigure([]),
        compartments.search_target.reconfigure([]),
      ],
    })

    return
  }

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const highlight = (plugin, view: EditorView, state: EditorState) => {
    const decoration_builder = new RangeSetBuilder<Decoration>()

    for (const range of view.visibleRanges) {
      const cursor = search_cursor(state.doc, range.from, range.to)

      while (!cursor.next().done) {
        decoration_builder.add(
          cursor.value.from,
          cursor.value.to,
          search_decoration,
        )
      }
    }

    plugin.decorations = decoration_builder.finish()
  }

  const search_view_plugin = ViewPlugin.define(
    (view) => {
      const plugin = {
        decorations: Decoration.none,
        update ({ view, state }) {
          highlight(this, view, state)
        },
      }

      highlight(plugin, view, view.state)

      return plugin
    },
    { decorations: (plugin) => plugin.decorations },
  )

  view.dispatch({
    effects: compartments.search.reconfigure(search_view_plugin),
  })

  await search_navigate()
}

async function search_navigate () {
  const limit = 1000

  let selection
  let total = 0

  const search_target_highlight = (plugin, state: EditorState) => {
    const decoration_builder = new RangeSetBuilder<Decoration>()

    const cursor = search_cursor(state.doc, 0, state.doc.length)

    let index = 0
    for (; !cursor.next().done; index++) {
      if (index > limit) {
        break
      }

      if (index + 1 === search.value.navigation.target) {
        selection = { anchor: cursor.value.from, head: cursor.value.to }
        decoration_builder.add(
          selection.anchor,
          selection.head,
          search_decoration_target,
        )
      }
    }

    total = index
    plugin.decorations = decoration_builder.finish()
  }

  const search_target_view_plugin = ViewPlugin.define(
    (view) => {
      const plugin = {
        decorations: Decoration.none,
        update ({ state }) {
          search_target_highlight(this, state)
        },
      }

      search_target_highlight(plugin, view.state)

      return plugin
    },
    { decorations: (plugin) => plugin.decorations },
  )

  view.dispatch({
    effects: compartments.search_target.reconfigure(search_target_view_plugin),
  })

  await store.dispatch('search/navigate', { total, target: undefined })

  if (selection === undefined) {
    return
  }

  view.dispatch({
    effects: EditorView.scrollIntoView(selection.anchor),
    selection: EditorSelection.range(selection.anchor, selection.head),
  })
}

async function input () {
  if (!view) {
    return
  }

  await debounce_save(properties.file.path)
}

watch(updated, input)

async function save (path) {
  const content = view.state.doc.toString()

  await store.dispatch('files/debounce_save', { path, content })
}

const debounce_save = debounce(save, 1000)

defineExpose({
  input,
  save,
})
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
