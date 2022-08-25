<template>
  <split-pane :min-percent='5' :default-percent='25' split="vertical">
    <template slot="paneL">
      <div class="fit" style="overflow-y: scroll;">
        <explorer ref="explorer" :enabled=explore @context="$emit('context', $event)" />
      </div>
    </template>

    <template slot="paneR">
      <div v-show="active" class="fit">
        <div v-show="!edit" class="fit" style="overflow: auto;">
          <empty-view v-if="directory">
            <v-icon style="font-size: 160px;">mdi-folder</v-icon>
          </empty-view>

          <empty-view v-if="readonly">
            <v-icon style="font-size: 160px;">mdi-file</v-icon>
          </empty-view>

          <div v-show="!(directory || readonly)">
            <div
              ref="rendered"
              id="editor-interface-rendered"
              class="pa-2"
              v-html="rendered"
              @contextmenu="$emit('context', { selection: { context }, event: $event })"
            />
          </div>
        </div>

        <div v-show="edit" class="fill-height">
          <empty-view v-show="directory">
            <v-icon large>mdi-folder</v-icon>
            <h4>{{ active }}</h4>
          </empty-view>

          <codemirror
            ref="editor"
            v-show="!directory"
            :options="codemirror_options"
            @inputRead=input
            @contextmenu="(cm, event) => $emit('context', { selection: { context }, event })"
          />
        </div>

      </div>
      <empty-view v-show="!active" >{{ error }}</empty-view>

    </template>
  </split-pane>
</template>

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

<script>
import { VIcon } from 'vuetify/lib'
import { clipboard } from 'electron'
import { debounce, delay } from 'lodash'
import marked from 'marked'
import Mark from 'mark.js'
import Explorer from '@/components/Explorer.vue'
import EmptyView from '@/views/Empty.vue'
import store from '@/store'

export default {
  props: {
    edit: { type: Boolean, default: false },
    commit: { type: Boolean, default: false }
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
  mounted: function () {
    this.mark = new Mark('#editor-interface-rendered')
  },
  computed: {
    codemirror: function () {
      return this.$refs.editor.codemirror
    },
    explore: function () {
      return !(this.commit || this.push)
    },
    active: function () {
      return store.state.files.active
    },
    rendered: function () {
      return marked(store.state.files.selected?.document?.content || '')
    },
    directory: function () {
      return store.state.files.selected?.directory || false
    },
    readonly: function () {
      return store.state.files.selected?.readonly || false
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
    context: function () {
      return [
        {
          title: 'Action',
          load: () => this.actions
        },
        { divider: true },
        {
          title: 'Cut',
          active: () => this.edit && !this.readonly,
          action: () => {
            const selection = this.codemirror.getSelection()

            clipboard.writeText(selection)
            this.codemirror.replaceSelection('')
          }
        },
        {
          title: 'Copy',
          action: () => {
            let selection
            if (this.edit) {
              selection = this.codemirror.getSelection()
            } else {
              selection = document.getSelection().toString()
            }

            clipboard.writeText(selection)
          }
        },
        {
          title: 'Paste',
          active: () => this.edit && !this.readonly,
          action: () => {
            this.codemirror.replaceSelection(clipboard.readText())
          }
        }
      ]
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
  methods: {
    refresh: async function (reset = false) {
      await this.debounce_save.flush()

      if (reset) {
        this.codemirror.doc.setValue(store.state.files.content || '')
      }

      this.codemirror.setOption('readOnly', this.readonly)

      if (this.readonly) {
        this.codemirror.setOption('mode', null)
      } else {
        this.codemirror.setOption('mode', 'text/x-markdown')
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

      await this.$emit('save', { path, content })
    },
    search: async function () {
      if (this.overlay) {
        this.codemirror.removeOverlay(this.overlay, true)
      }

      await new Promise((resolve, reject) => {
        this.mark.unmark({ done: resolve })
      })

      if (!this.query) {
        this.regex = null
        return
      }

      try {
        this.regex = new RegExp(
          this.regex_query ? this.query : String(this.query).replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'),
          String('g').concat(this.case_sensitive ? '' : 'i')
        )
      } catch (error) {
        await store.dispatch('error', error)
        return
      }

      if (this.edit) {
        this.overlay = {
          token: (stream) => {
            this.regex.lastIndex = stream.pos
            const match = this.regex.exec(stream.string)
            if (match && match.index === stream.pos) {
              stream.pos += match[0].length || 1
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
        const total = await new Promise((resolve, reject) => {
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
      if (this.edit) {
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
          } catch (_) { }
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
  },
  components: {
    VIcon,
    Explorer,
    EmptyView
  }
}
</script>
