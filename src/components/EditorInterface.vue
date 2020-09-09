<template>
  <split-pane :min-percent='5' :default-percent='25' split="vertical">
    <template slot="paneL">
      <scrolly class="foo" :style="{ width: '100%', height: '100%' }">
        <scrolly-viewport>
          <explorer ref="explorer" :enabled=explore @context="$emit('context', $event)" />
        </scrolly-viewport>
        <scrolly-bar axis="y" style="margin-right: 2px;" />
        <scrolly-bar axis="x" style="margin-bottom: 2px;" />
      </scrolly>
    </template>

    <template slot="paneR">
      <scrolly v-show="!edit" ref="window" class="foo" :style="{ width: '100%', height: '100%' }">
        <scrolly-viewport>
          <div class="fill-height">
            <div v-show="content" style="height: 100%; padding: 0px;" >
              <div id="editor-interface-rendered" ref="rendered" v-html="rendered" class="pa-2" />
            </div>
            <empty-view v-if="!content" />
          </div>
        </scrolly-viewport>
        <scrolly-bar axis="y"></scrolly-bar>
        <scrolly-bar axis="x"></scrolly-bar>
      </scrolly>

      <div v-show="edit" class="fill-height">
        <commit-view v-if="commit" @close="$emit('commit:close')" />
        <push-view v-else-if="push" @close="$emit('push:close')" />

        <codemirror ref="editor" v-if="edit && active" :value="content" @input=save />
        <div v-else class="full_size">
          <empty-view>{{ error }}</empty-view>
        </div>
      </div>

    </template>
  </split-pane>
</template>

<style>
.fill-height {
  height: 100%;
}

.splitter-paneL,
.splitter-paneR {
  overflow: hidden;
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
  border: 1px solid #eee;
  height: 100% !important;
  width: 100% !important;
  min-height: 100% !important;
  min-width: 100% !important;
  overflow: hidden;
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
import { Scrolly, ScrollyViewport, ScrollyBar } from 'vue-scrolly'
import marked from 'marked'
import Mark from 'mark.js'
import Explorer from '@/components/Explorer.vue'
import EmptyView from '@/views/Empty.vue'
import CommitView from '@/views/Commit.vue'
import PushView from '@/views/Push.vue'

export default {
  props: {
    edit: { type: Boolean, default: false },
    commit: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  data: () => ({
    absolute_path: '',
    actions: [],
    error: '',
    overlay: null,
    mark: null,
    regex: null,
    focus: null,
    mode: {
      read: {
        results: null
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
    explore: function () {
      return !(this.commit || this.push)
    },
    active: function () {
      return this.$store.state.files.active
    },
    content: function () {
      return this.$store.state.files.content || ''
    },
    rendered: function () {
      return marked(this.content)
    },
    query: function () {
      return this.$store.state.search.query
    },
    target: function () {
      return this.$store.state.search.navigation.target
    }
  },
  watch: {
    edit: async function () {
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
    save (content) {
      this.$store.dispatch('files/save', { content })
    },
    search: async function () {
      this.regex = new RegExp(String(this.query).replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'), 'gi')

      if (this.edit) {
        const cm = this.$refs.editor.codemirror

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

        this.$store.dispatch('search/navigate', { total, target: null })
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
                this.$store.dispatch('search/navigate', { total, target: null })
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
        const cm = this.$refs.editor.codemirror

        if (!this.mode.write.cursor) {
          this.mode.write.cursor = cm.getSearchCursor(this.query, 0, { caseFold: true })
        }

        if (!this.mode.write.position) {
          this.mode.write.position = 0
        }

        if (this.$store.state.search.navigation.target > 0) {
          while (this.mode.write.position !== this.$store.state.search.navigation.target) {
            if (this.$store.state.search.navigation.target < this.mode.write.position) {
              this.mode.write.position--

              this.mode.write.cursor.findPrevious()
            } else if (this.$store.state.search.navigation.target > this.mode.write.position) {
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

        this.focus = this.mode.read.results[this.$store.state.search.navigation.target - 1]

        if (this.focus) {
          this.focus.classList.add('highlight-rendered-focus')
          this.focus.scrollIntoView()
        }
      }
    }
  },
  components: {
    Scrolly,
    ScrollyViewport,
    ScrollyBar,
    Explorer,
    EmptyView,
    CommitView,
    PushView
  }
}
</script>
