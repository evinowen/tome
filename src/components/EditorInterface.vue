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

          <div v-show="!edit">
            <div v-show="content" style="height: 100%; padding: 0px;" >
              <div id="editor-interface-rendered" ref="rendered" v-html="rendered" class="pa-2" />
            </div>
            <empty-view v-if="!content" />
          </div>

          <div v-show="edit">
            <!-- COMMIT WINDOW -->
            <commit-view v-if="commit" @close="$emit('commit:close')" />

            <!-- PUSH WINDOW -->
            <push-view v-else-if="push" @close="$emit('push:close')" />

            <!-- OPEN FILE WINDOW -->
            <codemirror ref="editor" v-else-if="content" :value="content" style="height: 100%;" @input=save />

            <!-- ACTION OR ERROR MENUS -->
            <div v-else class="full_size">
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
  height: auto !important;
  width: auto !important;
  overflow: hidden;
}

</style>

<script>
import store from '@/store'
import { Scrolly, ScrollyViewport, ScrollyBar } from 'vue-scrolly'
import marked from 'marked'
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
    error: ''
  }),
  computed: {
    explore: function () {
      return !(this.commit || this.push)
    },
    content: function () {
      return store.state.files.content
    },
    rendered: function () {
      return marked(this.content)
    },
    tome: function () {
      return store.state.tome
    }
  },
  methods: {
    save: async (content) => store.dispatch('files/save', { content })
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
