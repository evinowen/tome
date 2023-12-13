<template>
  <div
    ref="root"
    class="root"
    @contextmenu="contextmenu"
  />
</template>

<script lang="ts">

export default {}
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { fetchStore, File } from '@/store'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { Compartment, EditorSelection, Extension, RangeSetBuilder, EditorState } from '@codemirror/state'
import { SearchCursor, RegExpCursor } from '@codemirror/search'
import { Decoration, EditorView, keymap, lineNumbers, ViewPlugin } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { debounce } from 'lodash'

const store = fetchStore()

export interface Props {
  file?: File,
}

const props = withDefaults(defineProps<Props>(), {
  file: undefined,
})

const root = ref<HTMLElement>(null)

interface Compartments {
  language: Compartment,
  line_numbers: Compartment,
  tabs: Compartment,
  theme: Compartment,
  search: Compartment,
  search_target: Compartment
}

const compartments: Compartments = {
  language: new Compartment,
  line_numbers: new Compartment,
  tabs: new Compartment,
  theme: new Compartment,
  search: new Compartment,
  search_target: new Compartment
}

const search_decoration: Decoration = Decoration.mark({ class: 'highlight' })
const search_decoration_target: Decoration = Decoration.mark({ class: 'highlight-target' })

const theme_light_mode: Extension = EditorView.baseTheme({
  '.highlight': {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    outline: '2px solid rgba(255, 0, 0, 0.2)'
    },
  '.highlight-target': {
    backgroundColor: 'rgba(255, 0, 0, 0.4)',
    outline: '2px solid rgba(255, 0, 0, 0.4)'
    }
})

const theme_dark_mode: Extension = oneDark

const updated = ref(0)
let view: EditorView

const line_numbers = computed((): boolean => {
  return store.state.configuration.dark_mode
})

const dark_mode = computed((): boolean => {
  return store.state.configuration.dark_mode
})

const search = computed(() => {
  return store.state.search
})

const search_state = computed(() => {
  return [
    search.value.query,
    search.value.regex_query,
    search.value.case_sensitive,
    search.value.navigation.target
  ]
})

watch(line_numbers, configure_line_numbers)
function configure_line_numbers () {
  view.dispatch({
    effects: compartments.line_numbers.reconfigure(line_numbers.value ? lineNumbers() : [])
  })
}

watch(dark_mode, configure_dark_mode)
function configure_dark_mode () {
  view.dispatch({
    effects: compartments.theme.reconfigure(dark_mode.value ? theme_dark_mode : theme_light_mode)
  })
}

watch(() => props.file, () => {
  if (!props.file) {
    return
  }

  let language: Extension
  switch (props.file.extension) {
    case '.md':
      language = markdown()
      break

    case '.js':
    case '.json':
      language = javascript()
      break
  }

  view.dispatch({
    effects: compartments.language.reconfigure(language ?? [])
  })

  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: props.file.document.content
    }
  })
})

const actions = computed(() => {
  return store.state.actions.options.map(name => ({
    title: name,
    action: async () => {
      const selection = selection_fetch()
      const output = await store.dispatch('actions/execute', { name, target: props.file.path, selection })

      selection_replace(output || selection)

      await input()
    }
  }))
})

const context = computed(() => {
  return [
    {
      title: 'Action',
      load: () => actions.value
    },
    { divider: true },
    {
      title: 'Cut',
      active: () => !props.file.readonly,
      action: async () => {
        const selection = selection_fetch()

        await store.dispatch('clipboard/text', selection)
        selection_replace('')
      }
    },
    {
      title: 'Copy',
      action: async () => {
        const selection = selection_fetch()

        await store.dispatch('clipboard/text', selection)
      }
    },
    {
      title: 'Paste',
      active: () => !props.file.readonly,
      action: async () => {
        const clipboard = await store.dispatch('clipboard/text')
        selection_replace(clipboard)
      }
    }
  ]
})

async function contextmenu (event) {
  const position = {
    x: event.clientX,
    y: event.clientY
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
      }
    })
  )

  view = new EditorView({
    extensions: [
      detect_update,
      history(),
      keymap.of([
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab
      ]),
      syntaxHighlighting(defaultHighlightStyle),
      compartments.language.of([]),
      compartments.line_numbers.of([]),
      compartments.theme.of([]),
      compartments.search.of([]),
      compartments.search_target.of([]),
    ],
    parent: root.value
  })

  configure_line_numbers()
  configure_dark_mode()
  select()
})

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
    : new SearchCursor(text, query, from, to, case_sensitive ? undefined : x => x.toLowerCase())
}

watch(search_state, select)
async function select () {
  if (!props.file) {
    return
  }

  if (search.value.query.length === 0) {
    await store.dispatch('search/navigate', { total: 0, target: 0 })

    view.dispatch({
      effects: [
        compartments.search.reconfigure([]),
        compartments.search_target.reconfigure([])
      ]
    })

    return
  }

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const highlight = (plugin, view: EditorView, state: EditorState) => {
    const decoration_builder = new RangeSetBuilder<Decoration>()

    for (const range of view.visibleRanges) {
      const cursor = search_cursor(state.doc, range.from, range.to)

      while(!cursor.next().done) {
        decoration_builder.add(
          cursor.value.from,
          cursor.value.to,
          search_decoration
        )
      }
    }

    plugin.decorations = decoration_builder.finish()
  }

  const search_view_plugin = ViewPlugin.define(
    view => {
      const plugin = {
        decorations: Decoration.none,
        update({view, state}) { highlight(this, view, state) }
      }

      highlight(plugin, view, view.state)

      return plugin
    },
    { decorations: plugin => plugin.decorations }
  )

  view.dispatch({
    effects: compartments.search.reconfigure(search_view_plugin)
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
          search_decoration_target
        )
      }
    }

    total = index
    plugin.decorations = decoration_builder.finish()
  }

  const search_target_view_plugin = ViewPlugin.define(
    view => {
      const plugin = {
        decorations: Decoration.none,
        update({ state}) { search_target_highlight(this, state) }
      }

      search_target_highlight(plugin, view.state)

      return plugin
    },
    { decorations: plugin => plugin.decorations }
  )

  view.dispatch({
    effects: compartments.search_target.reconfigure(search_target_view_plugin)
  })

  await store.dispatch('search/navigate', { total, target: undefined })

  if (selection === undefined) {
    return
  }

  view.dispatch({
    effects: EditorView.scrollIntoView(selection.anchor),
    selection: EditorSelection.range(selection.anchor, selection.head)
  })
}

async function input () {
  if (!view) {
    return
  }

  await debounce_save(props.file.path)
}

watch(updated, input)

async function save (path) {
  const content = view.state.doc.toString()

  await store.dispatch('files/debounce_save', { path, content })
}

const debounce_save = debounce(save, 1000)

</script>

<style scoped>
.root,
.root :deep(.cm-editor) {
  height: 100%;
  width: 100%;
}
</style>
