<template>
  <split-pane v-if="tome.path" :min-percent='5' :default-percent='25' split="vertical">
    <template slot="paneL">
      <scrolly class="foo" :style="{ width: '100%', height: '100%' }">
        <scrolly-viewport>
          <explorer
            :name=tome.name
            :path=tome.path
            :populate=load_path
            v-on:selected=load_file
            v-on="$listeners"
          />
        </scrolly-viewport>
        <scrolly-bar axis="y" style="margin-right: 2px;"></scrolly-bar>
        <scrolly-bar axis="x" style="margin-bottom: 2px;"></scrolly-bar>
      </scrolly>
    </template>

    <template slot="paneR">
      <scrolly class="foo" :style="{ width: '100%', height: '100%' }">
        <scrolly-viewport>

          <template v-if="false" />

          <template v-else-if="!edit">
            <div v-if="absolute_path" style="height: 100%; padding: 0px;" >
              <div v-html="rendered" class="pa-2" />
            </div>
            <empty-view editor-interface-empty v-else />
          </template>

          <!-- COMMIT WINDOW -->
          <commit-view
            v-else-if="commit"
            @close="$emit('commit:close')"
            :repository="tome.repository"
            :available="tome.status.available"
            :staged="tome.status.staged"
            :default_name="configuration.name"
            :default_email="configuration.email"
          />

          <!-- PUSH WINDOW -->
          <push-view
            v-else-if="push"
            @close="$emit('push:close')"
            :repository="tome.repository"
            :branch="tome.branch.name"
            :default_private_key="configuration.private_key"
            :default_public_key="configuration.public_key"
            :default_passphrase="configuration.passphrase"

          />

          <!-- OPEN FILE WINDOW -->
          <codemirror v-else-if="absolute_path" :value="content" style="height: 100%;" @input="save_file" />

          <!-- ACTION OR ERROR MENUS -->
          <v-content v-else style="height: 100%; padding: 0px;">
            <template v-if="actions">
              <action-view :actions="actions">
                <div class="display-2">{{ tome.name }}</div>
                <hr />
                <div class="title">{{ relative_path }}</div>

              </action-view>

            </template>
            <template v-else>
              <empty-view>{{ error }}</empty-view>
            </template>

          </v-content>

        </scrolly-viewport>
        <scrolly-bar axis="y"></scrolly-bar>
        <scrolly-bar axis="x"></scrolly-bar>
      </scrolly>

    </template>
  </split-pane>

  <v-content v-else>
    <empty-view>{{ error || "" }}</empty-view>
  </v-content>

</template>

<style>
.splitter-paneL,
.splitter-paneR {
  overflow: hidden;
  height: auto !important;
  top: 0;
  bottom: 0;
  padding: 0 !important;
  margin-bottom: 28px;
}

.splitter-pane-resizer {
  border-color: transparent !important;
}

.CodeMirror {
  border: 1px solid #eee;
  height: auto !important;
  width: auto !important;
  overflow: hidden;
}

</style>

<script>
import { remote } from 'electron'
import { Scrolly, ScrollyViewport, ScrollyBar } from 'vue-scrolly'
import marked from 'marked'

import Explorer from './Explorer.vue'

import EmptyView from '@/views/Empty.vue'
import ActionView from '@/views/Action.vue'
import CommitView from '@/views/Commit.vue'
import PushView from '@/views/Push.vue'

export default {
  props: {
    tome: { type: Object },
    configuration: { type: Object },
    edit: { type: Boolean, default: false },
    commit: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },

  data: () => ({
    absolute_path: '',
    content: '',
    actions: [],
    error: 'Error Test',
    selected: null
  }),

  created: function () {
    this.fs = remote.require('fs')
    this.path = remote.require('path')
  },

  mounted: async function () {

  },

  methods: {

    load_path: async function (item) {
      console.log('load_path', item)
      console.log('load_path directory?', item.directory)
      console.log('load_path path?', item.path)
      console.log('load_path children?', item.children)

      const file_ext = function (ext) {
        switch (ext) {
          case '.md':
            return { icon: 'mdi-file-code', disabled: false, color: 'blue' }

          case '.gif':
          case '.jpg':
          case '.jpeg':
          case '.png':
            return { icon: 'mdi-file-image', disabled: true, color: 'green' }
            return 'mdi-file-image'

          default:
            return { icon: 'mdi-file-remove', disabled: true }
        }
      }

      return !item.directory ? true : new Promise((resolve, reject) => this.fs.readdir(
        item.path,
        { withFileTypes: true },
        (err, files) => err ? reject(err) : resolve(files)
      ))
        .then(children => children.map(
          child => ({
            name: child.name,
            path: this.path.join(item.path, child.name),
            directory: child.isDirectory(),
            ...file_ext(this.path.extname(child.name).toLowerCase())
          })
        )
        )
        .then(children => {
          children.forEach(child => {
            if (child.directory) {
              child.children = []
              if (!['.git'].includes(child.name)) {
                child.disabled = false
              }
            }
          })

          item.children.push(...children)

          return true
        })
        .catch(err => console.warn(err))
    },

    load_file: async function (node) {
      this.error = ''

      this.absolute_path = null

      this.actions = null
      this.selected = null

      console.log('load_file', node)

      if (!node) {
        this.actions = []
        return
      }

      this.selected = node
      this.absolute_path = this.selected.path

      const status = await new Promise((resolve, reject) => this.fs.lstat(this.absolute_path, (err, status) => err ? reject(err) : resolve(status)))

      if (status.isDirectory()) {
        this.error = this.path.basename(this.absolute_path)
        this.actions = [
          {
            name: 'New File',
            icon: 'mdi-file-star',
            action: (event) => {
              console.log('new file', event)
              // this.tome_add_file_val = ''
              // this.tome_add_file_path_rel = ''
              // this.tome_add_file_as_directory = false
              // this.tome_add_file = true
            }
          },
          {
            name: 'New Folder',
            icon: 'mdi-folder-star',
            action: (event) => {
              console.log('new folder', event)
              // this.tome_add_file_val = ''
              // this.tome_add_file_path_rel = ''
              // this.tome_add_file_as_directory = true
              // this.tome_add_file = true
            }
          },
          {
            name: 'Open Folder',
            icon: 'mdi-folder-move',
            action: (event) => {
              console.log('open folder', event)
              shell.openItem(this.absolute_path)
            }
          }
        ]
        return
      }

      const ext = this.path.extname(this.absolute_path).toLowerCase()

      if (ext != '.md') {
        this.error = `File has invalid ${ext} extension.`
        return
      }

      this.content = this.fs.readFileSync(this.absolute_path, 'utf8')
    },

    save_file: async function (value) {
      this.fs.writeFileSync(this.absolute_path, value)

      this.content = value

      this.reload_start()
    }

  },

  computed: {
    relative_path: function () {
      return this.absolute_path ? `${this.path.relative(this.tome.path, this.absolute_path)}` : ''
    },

    rendered: function () {
      return marked(this.content)
    }

  },

  components: {
    Explorer,

    Scrolly,
    ScrollyViewport,
    ScrollyBar,

    EmptyView,
    ActionView,
    CommitView,
    PushView

  }

}
</script>
