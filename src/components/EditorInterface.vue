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

.highlight-rendered {
  background-color: yellow;
  color: black;
}

.highlight-rendered-focus {
  outline: 3px solid #FF9810;
  color: black;
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
    actions: [],
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
    target: function () {
      return store.state.search.navigation.target
    },
    context: function () {
      return [
        {
          title: 'Cut',
          active: () => this.edit && !this.readonly,
          action: () => {
            const cm = this.codemirror
            const selection = cm.getSelection()

            clipboard.writeText(selection)
            cm.replaceSelection('')
          }
        },
        {
          title: 'Copy',
          action: () => {
            let selection
            if (this.edit) {
              const cm = this.codemirror
              selection = cm.getSelection()
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
            const cm = this.codemirror
            cm.replaceSelection(clipboard.readText())
          }
        }
      ]
    },
    codemirror_options: function () {
      return {
        theme: store.state.configuration.dark_mode ? 'base16-dark' : 'base16-light'
      }
    },
    debounce_save: function () {
      return debounce(this.save, 500)
    }
  },
  watch: {
    active: async function () {
      await this.debounce_save.flush()

      this.codemirror.doc.setValue(store.state.files.content)

      this.codemirror.setOption('readOnly', this.readonly)

      if (this.readonly) {
        this.codemirror.setOption('mode', null)
      } else {
        this.codemirror.setOption('mode', 'text/x-markdown')
      }
    },
    edit: async function (value) {
      await this.debounce_save.flush()

      if (value) {
        delay(() => this.codemirror.refresh(), 100)
      }

      await this.search()
    },
    query: async function () {
      await this.search()
    },
    content: async function () {
      await this.search()
    },
    rendered: async function () {
      await this.search()
    },
    target: async function () {
      await this.navigate()
    }
  },
  methods: {
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
      if (!this.query) {
        this.regex = null
        return
      }

      this.regex = new RegExp(String(this.query).replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'), 'gi')

      if (this.edit) {
        const cm = this.codemirror

        if (this.overlay) {
          cm.removeOverlay(this.overlay, true)
        }

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

        cm.addOverlay(this.overlay, { opaque: true })

        this.mode.write.cursor = null
        this.mode.write.position = 0

        const cursor = cm.getSearchCursor(this.query, 0, { caseFold: true })
        let total = 0

        while (cursor.findNext()) {
          total++
        }

        await store.dispatch('search/navigate', { total, target: null })
      } else {
        await new Promise((resolve, reject) => {
          this.mark.unmark({ done: resolve })
        })

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
        const cm = this.codemirror

        if (!this.mode.write.cursor) {
          this.mode.write.cursor = cm.getSearchCursor(this.query, 0, { caseFold: true })
        }

        if (!this.mode.write.position) {
          this.mode.write.position = 0
        }

        if (store.state.search.navigation.target > 0) {
          while (this.mode.write.position !== store.state.search.navigation.target) {
            if (store.state.search.navigation.target < this.mode.write.position) {
              this.mode.write.position--

              this.mode.write.cursor.findPrevious()
            } else if (store.state.search.navigation.target > this.mode.write.position) {
              this.mode.write.position++

              this.mode.write.cursor.findNext()
            }
          }

          const from = this.mode.write.cursor.from()
          const to = this.mode.write.cursor.to()

          cm.setSelection(from, to)
          cm.scrollIntoView({ from, to })
        }
      } else {
        if (this.focus) {
          this.focus.classList.remove('highlight-rendered-focus')
        }

        this.focus = this.mode.read.results[store.state.search.navigation.target - 1]

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
