<!-- eslint-disable vue/no-v-html -->
<template>
  <split-pane :min-percent="5" :default-percent="25" split="vertical">
    <template slot="paneL">
      <div class="fit" style="overflow-y: overlay;">
        <explorer ref="explorer" :enabled="explore" />
      </div>
    </template>

    <template slot="paneR">
      <div v-show="active" class="fit">
        <div v-show="view === 'rendered'" class="fill-height">
          <div
            id="editor-interface-rendered"
            ref="rendered"
            class="pa-2"
            @contextmenu="context"
            v-html="rendered"
          />
        </div>
        <div v-show="view === 'edit'" class="fill-height">
          <codemirror
            ref="editor"
            :options="codemirror_options"
            @inputRead="input"
            @contextmenu="(cm, event) => contextmenu(event)"
          />
        </div>
        <div v-show="view === 'empty'" class="fill-height">
          <template v-if="selected">
            <image-preview v-if="selected.image" :src="selected.path" />
            <empty-pane v-else class="fill-height">
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
              <v-divider v-if="selected.name" class="mt-4" />
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
import Vue from 'vue'
import { VDivider } from 'vuetify/lib'
import { debounce, delay } from 'lodash'
import { marked } from 'marked'
import Mark from 'mark.js'
import Explorer from '@/components/Explorer.vue'
import FileIcon from '@/components/FileIcon.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import EmptyPane from '@/components/EmptyPane.vue'
import store from '@/store'

export default Vue.extend({
  components: {
    VDivider,
    Explorer,
    EmptyPane,
    FileIcon,
    ImagePreview
  },
  data: () => ({
    error: '',
    overlay: null,
    mark: null,
    regex: null,
    focus: null,
    mode: {
      read: {
        results: []
      },
      write: {
        cursor: null,
        position: 0
      }
    }
  }),
  computed: {
    system: function () {
      return store.state.system
    },
    codemirror: function () {
      return this.$refs.editor.codemirror
    },
    explore: function () {
      return !(this.commit || this.push)
    },
    edit: function () {
      return store.state.system.edit
    },
    active: function () {
      return store.state.files.active
    },
    selected: function () {
      return store.state.files.selected
    },
    markdown: function () {
      return this.selected && (this.selected.extension === '.md')
    },
    html: function () {
      return this.selected && (['.htm', '.html'].includes(this.selected.extension))
    },
    rendered: function () {
      if (this.markdown) {
        return marked.parse(this.selected?.document?.content || '')
      }

      if (this.html) {
        return (this.selected?.document?.content || '')
      }

      return null
    },
    directory: function () {
      return this.selected?.directory || false
    },
    readonly: function () {
      return this.selected?.readonly || false
    },
    view: function () {
      if (this.selected) {
        if (this.system.edit && !(this.selected.image || this.selected.directory)) {
          return 'edit'
        }

        if (this.rendered !== null) {
          return 'rendered'
        }
      }

      return 'empty'
    },
    query: function () {
      return store.state.search.query
    },
    regex_query: function () {
      return store.state.search.regex_query
    },
    case_sensitive: function () {
      return store.state.search.case_sensitive
    },
    target: function () {
      return store.state.search.navigation.target
    },
    actions: function () {
      return store.state.actions.options.map(name => ({
        title: name,
        action: async () => {
          const selection = this.codemirror.getSelection()
          const result = await store.dispatch('actions/execute', { name, target: this.active, selection })

          this.codemirror.replaceSelection(result.selection || selection)

          await this.input()
        }
      }))
    },
    codemirror_options: function () {
      return {
        theme: store.state.configuration.dark_mode ? 'base16-dark' : 'base16-light'
      }
    },
    state: function () {
      return [
        this.query,
        this.content,
        this.rendered,
        this.regex_query,
        this.case_sensitive
      ]
    },
    debounce_save: function () {
      return debounce((path) => this.save(path), 500)
    },
    context: function () {
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

            await store.dispatch('clipboard/text', selection)
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

            await store.dispatch('clipboard/text', selection)
          }
        },
        {
          title: 'Paste',
          active: () => this.system.edit && !this.readonly,
          action: async () => {
            const clipboard = await store.dispatch('clipboard/text')
            this.codemirror.replaceSelection(clipboard)
          }
        }
      ]
    }
  },
  watch: {
    active: function () {
      this.refresh(true)
    },
    edit: function (value) {
      if (value) {
        this.refresh()
      }

      this.search()
    },
    state: function () {
      this.search()
    },
    target: function () {
      this.navigate()
    }
  },
  mounted: function () {
    this.mark = new Mark('#editor-interface-rendered')
  },
  methods: {
    contextmenu: async function (event) {
      const position = {
        x: event.clientX,
        y: event.clientY
      }

      await store.dispatch('context/open', { items: this.context, position })
    },
    refresh: async function (reset = false) {
      await this.debounce_save.flush()

      if (reset) {
        this.codemirror.doc.setValue(store.state.files.content || '')
      }

      this.codemirror.setOption('readOnly', this.readonly)

      if (this.selected) {
        switch (this.selected.extension) {
          case '.md':
            this.codemirror.setOption('mode', 'markdown')
            break

          case '.js':
          case '.json':
            this.codemirror.setOption('mode', 'javascript')
            break

          default:
            this.codemirror.setOption('mode', null)
            break
        }
      } else {
        this.codemirror.setOption('mode', null)
      }

      delay(() => this.codemirror.refresh(), 100)
    },
    input: async function () {
      await this.debounce_save(this.active)
    },
    save: async function (path) {
      const codemirror = this.codemirror
      const content_array = []

      codemirror.doc.eachLine((line) => { content_array.push(line.text) })

      const content = content_array.join('\n')

      await store.dispatch('files/save', { path, content })
    },
    search: async function () {
      if (this.overlay) {
        this.codemirror.removeOverlay(this.overlay, true)
      }

      await new Promise((resolve) => {
        this.mark.unmark({ done: resolve })
      })

      if (!this.query) {
        this.regex = null
        return
      }

      try {
        this.regex = new RegExp(
          this.regex_query ? this.query : String(this.query).replace(/[$()*+./?[\\\]^{|}-]/g, '\\$&'),
          String('g').concat(this.case_sensitive ? '' : 'i')
        )
      } catch (error) {
        await store.dispatch('error', error)
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

        this.mode.write.cursor = null
        this.mode.write.position = 0

        const cursor = this.codemirror.getSearchCursor(this.query, 0, { caseFold: true })
        let total = 0

        while (cursor.findNext()) {
          total++
        }

        await store.dispatch('search/navigate', { total, target: null })
      } else {
        const total = await new Promise((resolve) => {
          this.mark.markRegExp(
            this.regex,
            {
              className: 'highlight-rendered',
              separateWordSearch: false,
              acrossElements: false,
              done: total => {
                store.dispatch('search/navigate', { total, target: null })
                resolve(total)
              }
            }
          )
        })

        this.mode.read.results = this.$refs.rendered.querySelectorAll('mark > mark')

        if (this.mode.read.results.length !== total) {
          this.mode.read.results = this.$refs.rendered.querySelectorAll('mark')
        }
      }

      await this.navigate()
    },
    navigate: async function () {
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
})
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
