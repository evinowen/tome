<template>
  <split-pane v-if="tome.path" :min-percent='5' :default-percent='25' split="vertical">
    <template slot="paneL">
      <scrolly class="foo" :style="{ width: '100%', height: '100%' }">
        <scrolly-viewport>
          <explorer ref="explorer" v-model=selected v-on:input=load_file :populate=load_path :enabled=explore v-on="$listeners" @rename=rename_file @move=move_file />
        </scrolly-viewport>
        <scrolly-bar axis="y" style="margin-right: 2px;" />
        <scrolly-bar axis="x" style="margin-bottom: 2px;" />
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
            <empty-view v-else />
          </template>

          <!-- COMMIT WINDOW -->
          <commit-view v-else-if="commit" @close="$emit('commit:close')" />

          <!-- PUSH WINDOW -->
          <push-view v-else-if="push" @close="$emit('push:close')" />

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
    <empty-view editor-interface-empty>{{ error || "" }}</empty-view>
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
  margin-bottom: 18px;
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
import store from '@/store'
import { remote } from 'electron'
import { Scrolly, ScrollyViewport, ScrollyBar } from 'vue-scrolly'
import marked from 'marked'
import { v4 as uuidv4 } from 'uuid'

import EmptyView from '@/views/Empty.vue'
import ActionView from '@/views/Action.vue'
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
    content: '',
    actions: [],
    error: '',
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
      const file_ext = function (ext) {
        switch (ext) {
          case '.md':
            return { icon: 'mdi-file-code', disabled: false, color: 'blue' }

          case '.gif':
          case '.jpg':
          case '.jpeg':
          case '.png':
            return { icon: 'mdi-file-image', disabled: true, color: 'green' }

          default:
            return { icon: 'mdi-file-remove', disabled: true }
        }
      }

      if (item.directory) {
        return new Promise((resolve, reject) => this.fs.readdir(
          item.path,
          { withFileTypes: true },
          (err, files) => err ? reject(err) : resolve(files)
        )).then(children => children.map(
          child => ({
            uuid: uuidv4(),
            name: child.name,
            path: this.path.join(item.path, child.name),
            directory: child.isDirectory(),
            ...file_ext(this.path.extname(child.name).toLowerCase())
          })
        )).then(children => {
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
      }

      return true
    },

    load_file: async function () {
      this.error = ''
      this.actions = []
      this.absolute_path = null

      if (!this.selected) {
        return
      }

      this.absolute_path = this.selected.path

      const status = await new Promise((resolve, reject) => this.fs.lstat(this.absolute_path, (err, status) => err ? reject(err) : resolve(status)))

      if (status.isDirectory()) {
        this.error = this.path.basename(this.absolute_path)
        this.actions = [
          {
            name: 'New File',
            icon: 'mdi-file-star',
            action: (event) => { }
          },
          {
            name: 'New Folder',
            icon: 'mdi-folder-star',
            action: (event) => { }
          },
          {
            name: 'Open Folder',
            icon: 'mdi-folder-move',
            action: (event) => { }
          }
        ]
        return
      }

      const ext = this.path.extname(this.absolute_path).toLowerCase()

      if (ext !== '.md') {
        this.error = `File has invalid ${ext} extension.`
        return
      }

      this.content = this.fs.readFileSync(this.absolute_path, 'utf8')
    },

    save_file: async function (value) {
      this.content = value

      this.fs.writeFileSync(this.absolute_path, value)

      this.$emit('save')
    },
    rename_file: async function (path, proposed, update) {
      const directory = this.path.dirname(path)
      const proposed_full = this.path.join(directory, proposed)

      console.log(path, proposed, directory, proposed_full)

      const success = await new Promise((resolve, reject) => this.fs.rename(path, proposed_full, (err) => err ? reject(err) : resolve(true)))

      if (success) {
        console.log('rename_file success')
        update({ name: proposed, path: proposed_full })
        return
      }

      console.log('rename_file failed')
    },
    move_file: async function (path, proposed, context) {
      let directory = proposed
      try {
        const status = await new Promise((resolve, reject) => this.fs.lstat(proposed, (err, status) => err ? reject(err) : resolve(status)))

        if (!status.isDirectory()) {
          directory = this.path.dirname(proposed)
        }
      } catch (error) {
        return context.reject(error)
      }

      const basename = this.path.basename(path)
      const proposed_full = this.path.join(directory, basename)

      console.log(path, proposed, basename, proposed_full)

      if (directory === this.path.dirname(path)) {
        return context.reject('Invalid move, same directory')
      }

      try {
        await new Promise((resolve, reject) => this.fs.rename(path, proposed_full, (err) => err ? reject(err) : resolve(true)))
        return context.resolve(proposed_full)
      } catch (error) {
        return context.reject(error)
      }
    },
    rename: async function (path) {
      await this.$refs.explorer.edit()
    }
  },

  computed: {
    explore: function () {
      return !(this.commit || this.push)
    },

    relative_path: function () {
      return this.absolute_path ? `${this.path.relative(store.state.tome.path, this.absolute_path)}` : ''
    },

    rendered: function () {
      return marked(this.content)
    },

    tome: function () {
      return store.state.tome
    }

  },

  components: {
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
