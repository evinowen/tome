<!-- eslint-disable vue/no-v-html -->
<template>
  <split-pane>
    <template #left>
      <div
        class="fit"
        style="overflow-y: overlay;"
      >
        <explorer
          ref="explorer"
          :enabled="explore"
        />
      </div>
    </template>

    <template #right>
      <div
        v-show="active"
        class="fit"
      >
        <div
          v-show="view === 'rendered'"
          class="fill-height"
        >
          <div
            id="editor-interface-rendered"
            ref="rendered"
            class="pa-2"
            @contextmenu="contextmenu"
            v-html="rendered"
          />
        </div>
        <div
          v-show="view === 'edit'"
          class="fill-height"
        >
          <codemirror
            ref="editor"
            :options="codemirror_options"
            @inputRead="input"
            @contextmenu="(cm, event) => contextmenu(event)"
          />
        </div>
        <div
          v-show="view === 'empty'"
          class="fill-height"
        >
          <template v-if="selected !== undefined">
            <image-preview
              v-if="selected.image"
              :src="selected.path"
            />
            <empty-pane
              v-else
              class="fill-height"
            >
              <file-icon
                :path="selected.path"
                :directory="selected.directory"
                :extension="selected.extension"
                :image="selected.image"
                :relationship="''.concat(selected.relationship)"
                :expanded="selected.expanded"
                size="large"
                disabled
              />
              <v-divider
                v-if="selected.name"
                class="mt-4"
              />
              <div style="font-size: 2em;">
                {{ selected.name }}
              </div>
              <div style="font-size: 1.3em; opacity: 0.6">
                {{ selected.relative }}
              </div>
            </empty-pane>
          </template>
        </div>
      </div>
    </template>
  </split-pane>
</template>

<script lang="ts">
import { Vue, Component, Watch, Setup, toNative } from 'vue-facing-decorator'
import { VDivider } from 'vuetify/components'
import { delay } from 'lodash'
import { marked } from 'marked'
import Mark from 'mark.js'
import Explorer from '@/components/Explorer.vue'
import FileIcon from '@/components/FileIcon.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import EmptyPane from '@/components/EmptyPane.vue'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'
import VueCodeMirror from 'vue-codemirror'
import SplitPane from './EditorInterface/SplitPane.vue'
import File from '@/store/modules/files/file'

@Component({
  components: {
    VDivider,
    SplitPane,
    Explorer,
    EmptyPane,
    FileIcon,
    ImagePreview
  }
})
class EditorInterface extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  $refs: {
    editor: VueCodeMirror,
    rendered: HTMLElement
  }

  error = ''
  overlay?: any
  mark?: Mark
  regex?: RegExp
  focus?: any
  mode = {
    read: {
      results: [] as Element[]
    },
    write: {
      cursor: undefined as any,
      position: 0
    }
  }

  selected = File.Empty

  @Watch('active')
  select () {
    if (this.store.state.files.active === '') {
      this.selected = undefined
    }

    this.selected = this.store.state.files.directory[this.store.state.files.active]
  }

  get system () {
    return this.store.state.system
  }

  get codemirror () {
    return this.$refs.editor.codemirror
  }

  get explore () {
    return !(this.system.commit || this.system.push)
  }

  get edit () {
    return this.store.state.system.edit
  }

  get active () {
    return this.store.state.files.active
  }

  get markdown () {
    if (this.store.state.files.active === '') {
      return false
    }

    const selected = this.store.state.files.directory[this.store.state.files.active]
    return selected.extension === '.md'
  }

  get html () {
    if (this.store.state.files.active === '') {
      return false
    }

    const selected = this.store.state.files.directory[this.store.state.files.active]
    return ['.htm', '.html'].includes(selected.extension)
  }

  get rendered () {
    if(this.active === '') {
      return ''
    }

    const selected = this.store.state.files.directory[this.store.state.files.active]

    if (selected === undefined || selected.directory || !selected.document) {
      return ''
    }

    const content = selected.document.content || ''

    if (this.markdown) {
      return marked.parse(content)
    }

    if (this.html) {
      return content
    }

    return ''
  }

  get directory () {
    if (this.store.state.files.active === '') {
      return false
    }

    const selected = this.store.state.files.directory[this.store.state.files.active]
    return selected.directory
  }

  get readonly () {
    if (this.store.state.files.active === '') {
      return false
    }

    const selected = this.store.state.files.directory[this.store.state.files.active]
    return selected.readonly
  }

  get view () {
    if (this.store.state.files.active !== '') {
      const selected = this.store.state.files.directory[this.store.state.files.active]

      if (selected && !(selected.image || selected.directory)) {
        if (this.system.edit) {
          return 'edit'
        }

        if (this.rendered !== '') {
          return 'rendered'
        }
      }
    }

    return 'empty'
  }

  get query () {
    return this.store.state.search.query
  }

  get regex_query () {
    return this.store.state.search.regex_query
  }

  get case_sensitive () {
    return this.store.state.search.case_sensitive
  }

  get target () {
    return this.store.state.search.navigation.target
  }

  get actions () {
    return this.store.state.actions.options.map(name => ({
      title: name,
      action: async () => {
        const selected = this.store.state.files.directory[this.store.state.files.active]

        const selection = this.codemirror.getSelection()
        const output = await this.store.dispatch('actions/execute', { name, target: selected.path, selection })

        this.codemirror.replaceSelection(output || selection)

        await this.input()
      }
    }))
  }

  get codemirror_options () {
    return {
      theme: this.store.state.configuration.dark_mode ? 'base16-dark' : 'base16-light'
    }
  }

  get state () {
    return [
      this.query,
      // this.content,
      this.rendered,
      this.regex_query,
      this.case_sensitive
    ]
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
        active: () => this.system.edit && !this.readonly,
        action: async () => {
          const selection = this.codemirror.getSelection()

          await this.store.dispatch('clipboard/text', selection)
          this.codemirror.replaceSelection('')
        }
      },
      {
        title: 'Copy',
        action: async () => {
          let selection
          this.system.edit
            ? selection = this.codemirror.getSelection()
            : selection = document.getSelection().toString()

          await this.store.dispatch('clipboard/text', selection)
        }
      },
      {
        title: 'Paste',
        active: () => this.system.edit && !this.readonly,
        action: async () => {
          const clipboard = await this.store.dispatch('clipboard/text')
          this.codemirror.replaceSelection(clipboard)
        }
      }
    ]
  }

  @Watch('active')
  active_update () {
    this.refresh(true)
  }

  @Watch('edit')
  edit_update (value) {
    if (value) {
      this.refresh()
    }

    this.search()
  }

  @Watch('state')
  state_update () {
    this.search()
  }

  @Watch('target')
  target_update () {
    this.navigate()
  }

  mounted () {
    this.mark = new Mark('#editor-interface-rendered')
  }

  async contextmenu (event) {
    const position = {
      x: event.clientX,
      y: event.clientY
    }

    await this.store.dispatch('context/open', { items: this.context, position })
  }

  async refresh (reset = false) {
    await this.store.dispatch('files/debounce_flush')

    if (reset) {
      this.codemirror.doc.setValue(this.store.state.files.content || '')
    }

    this.codemirror.setOption('readOnly', this.readonly)

    if (this.store.state.files.active === '') {
      this.codemirror.setOption('mode')
    } else {
      const selected = this.store.state.files.directory[this.store.state.files.active]
      switch (selected.extension) {
        case '.md':
          this.codemirror.setOption('mode', 'markdown')
          break

        case '.js':
        case '.json':
          this.codemirror.setOption('mode', 'javascript')
          break

        default:
          this.codemirror.setOption('mode')
          break
      }
    }

    delay(() => this.codemirror.refresh(), 100)
  }

  async input () {
    const selected = this.store.state.files.directory[this.store.state.files.active]
    await this.save(selected.path)
  }

  async save (path) {
    const content_array = []

    this.codemirror.doc.eachLine((line) => { content_array.push(line.text) })

    const content = content_array.join('\n')

    await this.store.dispatch('files/debounce_save', { path, content })
  }

  async search () {
    if (this.overlay) {
      this.codemirror.removeOverlay(this.overlay, true)
    }

    await new Promise((resolve) => {
      this.mark.unmark({ done: resolve })
    })

    if (!this.query) {
      this.regex = undefined
      return
    }

    try {
      this.regex = new RegExp(
        this.regex_query ? this.query : String(this.query).replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&'),
        String('g').concat(this.case_sensitive ? '' : 'i')
      )
    } catch (error) {
      await this.store.dispatch('error', error)
      return
    }

    if (this.system.edit) {
      this.overlay = {
        token: (stream) => {
          this.regex.lastIndex = stream.pos
          const match = this.regex.exec(stream.string)
          if (match && match.index === stream.pos) {
            stream.pos += match[0].length > 0 ? match[0].length : 1
            return 'searching'
          } else if (match) {
            stream.pos = match.index
          } else {
            stream.skipToEnd()
          }
        }
      }

      this.codemirror.addOverlay(this.overlay, { opaque: true })

      this.mode.write.cursor = undefined
      this.mode.write.position = 0

      const cursor = this.codemirror.getSearchCursor(this.query, 0, { caseFold: true })
      let total = 0

      while (cursor.findNext()) {
        total++
      }

      await this.store.dispatch('search/navigate', { total, target: undefined })
    } else {
      const total = await new Promise((resolve) => {
        this.mark.markRegExp(
          this.regex,
          {
            className: 'highlight-rendered',
            acrossElements: false,
            done: total => {
              this.store.dispatch('search/navigate', { total, target: undefined })
              resolve(total)
            }
          }
        )
      })

      this.mode.read.results = [...this.$refs.rendered.querySelectorAll('mark > mark')]

      if (this.mode.read.results.length !== total) {
        this.mode.read.results = [...this.$refs.rendered.querySelectorAll('mark')]
      }
    }

    await this.navigate()
  }

  async navigate () {
    if (this.system.edit) {
      if (!this.overlay) {
        return
      }

      if (!this.mode.write.cursor) {
        this.mode.write.cursor = this.codemirror.getSearchCursor(this.query, 0, { caseFold: true })
      }

      if (!this.mode.write.position) {
        this.mode.write.position = 0
      }

      if (this.target > 0) {
        while (this.mode.write.position !== this.target) {
          if (this.target < this.mode.write.position) {
            this.mode.write.position--

            this.mode.write.cursor.findPrevious()
          } else if (this.target > this.mode.write.position) {
            this.mode.write.position++

            this.mode.write.cursor.findNext()
          }
        }

        const from = this.mode.write.cursor.from()
        const to = this.mode.write.cursor.to()

        try {
          this.codemirror.setSelection(from, to)
          this.codemirror.scrollIntoView({ from, to })
        } catch {
          // Do nothing
        }
      }
    } else {
      if (this.focus) {
        this.focus.classList.remove('highlight-rendered-focus')
      }

      this.focus = this.mode.read.results[this.target - 1]

      if (this.focus) {
        this.focus.classList.add('highlight-rendered-focus')
        this.focus.scrollIntoView()
      }
    }
  }
}

export default toNative(EditorInterface)
</script>

<style>
.fit {
  width: 100%;
  height: 100%;
}

.splitter-paneL,
.splitter-paneR {
  height: auto !important;
  top: 0;
  bottom: 0;
  padding: 0 !important;
  margin-bottom: 18px;
}

.splitter-pane-resizer {
  border-color: transparent !important;
}

.full_size {
  height: 100%;
  padding: 0px;
}

.vue-codemirror {
  height: 100% !important;
  width: 100% !important;
}

.CodeMirror {
  height: 100% !important;
  width: 100% !important;
  min-height: 100% !important;
  min-width: 100% !important;
  overflow: hidden;
}

.CodeMirror-scrollbar-filler {
  background: transparent !important;
}

.cm-searching,
.highlight-rendered {
  background-color: rgba(255, 255, 0, 0.2) !important;
  outline: 2px solid rgba(255, 255, 0, 0.2);
}

.highlight-rendered-focus {
  background-color: rgba(255, 255, 0, 0.4) !important;
  outline: 2px solid rgba(255, 255, 0, 0.4);
}

</style>
