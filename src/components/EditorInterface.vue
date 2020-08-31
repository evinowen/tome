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
      <scrolly class="foo" :style="{ width: '100%', height: '100%' }">
        <scrolly-viewport>

          <div v-show="!edit" class="fill-height">
            <div v-show="content" style="height: 100%; padding: 0px;" >
              <div id="editor-interface-rendered" ref="rendered" v-html="rendered" class="pa-2" />
            </div>
            <empty-view v-if="!content" />
          </div>

          <div v-show="edit" class="fill-height">
            <!-- COMMIT WINDOW -->
            <commit-view v-if="commit" @close="$emit('commit:close')" />

            <!-- PUSH WINDOW -->
            <push-view v-else-if="push" @close="$emit('push:close')" />

            <!-- OPEN FILE WINDOW -->
            <codemirror ref="editor" v-show="active" :value="content" style="height: 100%;" @input=save />

            <!-- ACTION OR ERROR MENUS -->
            <div v-show="!active" class="full_size">
              <empty-view>{{ error }}</empty-view>
            </div>
          </div>

        </scrolly-viewport>
        <scrolly-bar axis="y"></scrolly-bar>
        <scrolly-bar axis="x"></scrolly-bar>
      </scrolly>

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

.CodeMirror {
  border: 1px solid #eee;
  min-height: 100% !important;
  min-width: 100% !important;
  overflow: hidden;
}

.highlight-rendered {
  background-color: lightgray;
  outline: 2px solid #FF9810;
  color: black;
}

</style>

<script>
import store from '@/store'
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
    mark: null
  }),
  mounted: function () {
    this.mark = new Mark('#editor-interface-rendered')
  },
  computed: {
    explore: function () {
      return !(this.commit || this.push)
    },
    active: function () {
      return store.state.files.active
    },
    content: function () {
      return store.state.files.content || ''
    },
    rendered: function () {
      return marked(this.content)
    },
    query: () => store.state.search.query
  },
  watch: {
    query: function () {
      this.search()
    },
    active: function () {
      this.search()
    },
    edit: function () {
      this.search()
    },
    content: function () {
      this.search()
    },
    rendered: function () {
      this.search()
    }
  },
  methods: {
    save: async (content) => store.dispatch('files/save', { content }),
    search: async function () {
      const query = new RegExp(String(this.query).replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'), 'gi')

      if (this.edit) {
        if (!this.$refs.editor) {
          console.log('no editor!', this.query)
          return
        }

        const cm = this.$refs.editor.codemirror

        if (this.overlay) {
          cm.removeOverlay(this.overlay, true)
        }

        this.overlay = {
          token: (stream) => {
            query.lastIndex = stream.pos
            const match = query.exec(stream.string)
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

        cm.addOverlay(this.overlay, true)

        console.log('codemirror', cm, Object.assign({}, cm))
      } else {
        this.mark.unmark()
        this.mark.markRegExp(
          query,
          {
            className: 'highlight-rendered',
            done: total => store.dispatch('search/visible', { total, target: null })
          }
        )
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
