<template>
  <div
    ref="root"
    class="root"
    @contextmenu="contextmenu"
  />
</template>

<script lang="ts">
import { Prop, Component, Vue, Setup, toNative, Watch } from 'vue-facing-decorator'
import { Store } from 'vuex'
import { State, File, fetchStore } from '@/store'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { Compartment, EditorSelection, Extension, RangeSetBuilder, EditorState } from '@codemirror/state'
import { SearchCursor, RegExpCursor } from '@codemirror/search'
import { Decoration, EditorView, keymap, lineNumbers, ViewPlugin } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { debounce } from 'lodash'

@Component({})
class TextEdit extends Vue {
  $refs: {
    root: HTMLElement
  }

  @Setup(() => fetchStore())
  store: Store<State>

  @Setup(() => ({
    language: new Compartment,
    line_numbers: new Compartment,
    tabs: new Compartment,
    theme: new Compartment,
    search: new Compartment,
    search_target: new Compartment
  }))
  compartment: {
    language: Compartment,
    line_numbers: Compartment,
    tabs: Compartment,
    theme: Compartment,
    search: Compartment,
    search_target: Compartment
  }

  @Setup(() => Decoration.mark({ class: 'highlight' }))
  search_decoration: Decoration

  @Setup(() => Decoration.mark({ class: 'highlight-target' }))
  search_decoration_target: Decoration

  @Setup(() => EditorView.baseTheme({
    '.highlight': {
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      outline: '2px solid rgba(255, 0, 0, 0.2)'
     },
    '.highlight-target': {
      backgroundColor: 'rgba(255, 0, 0, 0.4)',
      outline: '2px solid rgba(255, 0, 0, 0.4)'
     }
  }))
  theme_light_mode: Extension

  @Setup(() => oneDark)
  theme_dark_mode: Extension

  @Prop({ type: File, default: undefined })
  file?: File

  updated = 0
  view?: EditorView

  get line_numbers (): boolean {
    return this.store.state.configuration.dark_mode
  }

  get dark_mode (): boolean {
    return this.store.state.configuration.dark_mode
  }

  get search () {
    return this.store.state.search
  }

  get search_state () {
    return [
      this.search.query,
      this.search.regex_query,
      this.search.case_sensitive,
      this.search.navigation.target
    ]
  }

  @Watch('line_numbers')
  configure_line_numbers () {
    this.view.dispatch({
      effects: this.compartment.line_numbers.reconfigure(this.line_numbers ? lineNumbers() : [])
    })
  }

  @Watch('dark_mode')
  configure_dark_mode () {
    this.view.dispatch({
      effects: this.compartment.theme.reconfigure(this.dark_mode ? this.theme_dark_mode : this.theme_light_mode)
    })
  }

  @Watch('file')
  select (): void {
    if (!this.file) {
      return
    }

    let language: Extension
    switch (this.file.extension) {
      case '.md':
        language = markdown()
        break

      case '.js':
      case '.json':
        language = javascript()
        break
    }

    this.view.dispatch({
      effects: this.compartment.language.reconfigure(language ?? [])
    })

    this.view.dispatch({
      changes: {
        from: 0,
        to: this.view.state.doc.length,
        insert: this.file.document.content
      }
    })
  }

  get actions () {
    return this.store.state.actions.options.map(name => ({
      title: name,
      action: async () => {
        const selection = this.selection_fetch()
        const output = await this.store.dispatch('actions/execute', { name, target: this.file.path, selection })

        this.selection_replace(output || selection)

        await this.input()
      }
    }))
  }

  get context () {
    return [
      {
        title: 'Action',
        load: () => this.actions
      },
      { divider: true },
      {
        title: 'Cut',
        active: () => !this.file.readonly,
        action: async () => {
          const selection = this.selection_fetch()

          await this.store.dispatch('clipboard/text', selection)
          this.selection_replace('')
        }
      },
      {
        title: 'Copy',
        action: async () => {
          const selection = this.selection_fetch()

          await this.store.dispatch('clipboard/text', selection)
        }
      },
      {
        title: 'Paste',
        active: () => !this.file.readonly,
        action: async () => {
          const clipboard = await this.store.dispatch('clipboard/text')
          this.selection_replace(clipboard)
        }
      }
    ]
  }

  async contextmenu (event) {
    const position = {
      x: event.clientX,
      y: event.clientY
    }

    await this.store.dispatch('context/open', { items: this.context, position })
  }

  mounted() {
    const detect_update = ViewPlugin.define(
      () => ({
        update: (update) => {
          if (!update.docChanged) {
            return
          }

          this.updated++
        }
      })
    )

    this.view = new EditorView({
      extensions: [
        detect_update,
        history(),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab
        ]),
        syntaxHighlighting(defaultHighlightStyle),
        this.compartment.language.of([]),
        this.compartment.line_numbers.of([]),
        this.compartment.theme.of([]),
        this.compartment.search.of([]),
        this.compartment.search_target.of([]),
      ],
      parent: this.$refs.root
    })

    this.configure_line_numbers()
    this.configure_dark_mode()
    this.select()
  }

  selection_fetch () {
    let value = ''
    const selection = this.view.state.selection
    if (selection !== undefined) {
      for (const range of selection.ranges) {
        value += this.view.state.doc.slice(range.from, range.to)
      }
    }

    return value
  }

  selection_replace (value) {
    this.view.dispatch(this.view.state.replaceSelection(value))
  }

  search_cursor (text, from, to) {
    const { query, regex_query, case_sensitive } = this.search
    return regex_query
      ? new RegExpCursor(text, query, { ignoreCase: !case_sensitive }, from, to)
      : new SearchCursor(text, query, from, to, case_sensitive ? undefined : x => x.toLowerCase())
  }

  @Watch('search_state')
  async search_mark () {
    if (!this.file) {
      return
    }

    if (this.search.query.length === 0) {
      await this.store.dispatch('search/navigate', { total: 0, target: 0 })

      this.view.dispatch({
        effects: [
          this.compartment.search.reconfigure([]),
          this.compartment.search_target.reconfigure([])
        ]
      })

      return
    }

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const highlight = (plugin, view: EditorView, state: EditorState) => {
      const decoration_builder = new RangeSetBuilder<Decoration>()

      for (const range of view.visibleRanges) {
        const cursor = this.search_cursor(state.doc, range.from, range.to)

        while(!cursor.next().done) {
          decoration_builder.add(
            cursor.value.from,
            cursor.value.to,
            this.search_decoration
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

    this.view.dispatch({
      effects: this.compartment.search.reconfigure(search_view_plugin)
    })

    await this.search_navigate()
  }

  async search_navigate () {
    const limit = 1000

    let selection
    let total = 0

    const search_target_highlight = (plugin, state: EditorState) => {
      const decoration_builder = new RangeSetBuilder<Decoration>()

      const cursor = this.search_cursor(state.doc, 0, state.doc.length)

      let index = 0
      for (; !cursor.next().done; index++) {
        if (index > limit) {
          break
        }

        if (index + 1 === this.search.navigation.target) {
          selection = { anchor: cursor.value.from, head: cursor.value.to }
          decoration_builder.add(
            selection.anchor,
            selection.head,
            this.search_decoration_target
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

    this.view.dispatch({
      effects: this.compartment.search_target.reconfigure(search_target_view_plugin)
    })

    await this.store.dispatch('search/navigate', { total, target: undefined })

    if (selection === undefined) {
      return
    }

    this.view.dispatch({
      effects: EditorView.scrollIntoView(selection.anchor),
      selection: EditorSelection.range(selection.anchor, selection.head)
    })
  }

  @Watch('updated')
  async input () {
    if (!this.view) {
      return
    }

    await this.debounce_save(this.file.path)
  }

  get debounce_save () {
    return debounce(this.save, 1000)
  }

  async save (path) {
    const content = this.view.state.doc.toString()

    await this.store.dispatch('files/debounce_save', { path, content })
  }
}

export default toNative(TextEdit)
</script>

<style scoped>
.root,
.root :deep(.cm-editor) {
  height: 100%;
  width: 100%;
}
</style>
