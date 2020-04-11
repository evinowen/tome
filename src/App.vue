<template>
  <v-app id="inspire">
    <system-bar title="tome" @settings="settings.open = true" />
    <v-navigation-drawer v-model="settings.open" fixed temporary>
      <v-list dense v-if="configuration">
        <v-list-item>
          <v-text-field small label="Name" v-model="configuration.name" @change="counter_start('settings')" />
        </v-list-item>
        <v-list-item>
          <v-text-field small label="E-Mail" v-model="configuration.email" @change="counter_start('settings')" />
        </v-list-item>
        <v-list-item>
          <v-container class="pa-0 mb-2">
            <div class="overline">Private Key</div>
            <input ref="private_key" type="file" style="display: none" @change="assign_key('private_key', $event)" />
            <v-btn tile icon small dark :color="configuration.private_key ? 'green' : 'red'" class="key-input" @click.stop="$refs.private_key.click()">
              <v-icon small>{{ configuration.private_key ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
              {{ configuration.private_key }}
            </v-btn>
          </v-container>
        </v-list-item>
        <v-list-item>
          <v-container class="pa-0 mb-2">
            <div class="overline">Public Key</div>
            <input ref="public_key" type="file" style="display: none" @change="assign_key('public_key', $event)" />
            <v-btn tile icon small dark :color="configuration.public_key ? 'green' : 'red'" class="key-input" @click.stop="$refs.public_key.click()">
              <v-icon small>{{ configuration.public_key ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
              {{ configuration.public_key }}
            </v-btn>
          </v-container>
        </v-list-item>
        <v-list-item>
          <v-text-field
            v-model="configuration.passphrase"
            label="passphrase" small clearable
            :append-icon="settings.obscure_passphrase ? 'mdi-eye-off' : 'mdi-eye'"
            :type="settings.obscure_passphrase ? 'password' : 'text'"
            @click:append="settings.obscure_passphrase = !settings.obscure_passphrase"
            @change="counter_start('settings')"
          />
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item>
          <v-switch v-model="configuration.format_titles" label="Format Titles" @change="counter_start('settings')"></v-switch>
        </v-list-item>
      </v-list>
      <template v-slot:append>
        <v-divider></v-divider>
        <v-container class="my-1">
          <v-layout justify-center align-center>
            <v-progress-circular
              v-if="settings.triggered"
              :value="(settings.counter * 100) / settings.max"
              :size="32"
              :width="6"
              color="orange darken-1"
            />
            <v-avatar v-else color="green" size="32">
              <v-icon dark>mdi-content-save</v-icon>
            </v-avatar>
          </v-layout>
        </v-container>
      </template>
    </v-navigation-drawer>

    <editor-interface
      :edit=edit
      :commit=commit
      :push=push
      @save=reload_start
      @commit:close="commit = false"
      @push:close="push = false"
      @context=open_context
    />

    <new-file-service
      :active="add.active"
      @close="add.active = false"
      @create="reload_selected_explorer"
      :base="tome.path" :target="add_target"
      :extension="add.as_directory ? null : 'md'"
      :folder="add.as_directory"
    />

    <context-menu-service
      v-model=context.visible
      :title=context.title
      :target=context.target
      :items=context.items
      :position_x=context.position.x
      :position_y=context.position.y
    />

    <action-bar
      :waiting=reload.counter
      :commit=commit
      :push=push
      @open=set_tome
      @edit="edit = $event"
      @commit="commit = true"
      @push="push = true"
    />
  </v-app>
</template>

<style>
html, body {
  font-size: 12px !important;
  overflow: hidden !important;

}

.v-icon.v-icon {
  font-size: 18px;

}

.key-input {
  width: 100% !important;
  padding: 0;
  height: 48px !important;
  font-size: 0.9em !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.key-input .v-icon {
  height: 28px !important;
  width: 28px !important;
  font-size: 2.0em !important;
}

.key-input span {
  width: 100% !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  justify-content: normal;
}

</style>

<script>
import store from './store'
import { remote, shell } from 'electron'

import NewFileService from './components/NewFileService.vue'
import ContextMenuService from './components/ContextMenuService.vue'

import SystemBar from './components/SystemBar.vue'
import EditorInterface from './components/EditorInterface.vue'
import ActionBar from './components/ActionBar.vue'

const fs = remote.require('fs')
const path = remote.require('path')

export default {
  props: {
    source: String
  },
  data: () => ({
    settings: {
      open: false,
      obscure_passphrase: true,
      triggered: false,
      counter: 0,
      max: 3
    },

    reload: {
      triggered: false,
      counter: 0,
      max: 3
    },

    edit: false,
    commit: false,
    push: false,

    add: {
      active: false,
      value: '',
      relative_path: '',
      as_directory: false
    },

    context: {
      visible: false,
      title: null,
      target: null,
      items: [],
      position: { x: 0, y: 0 }
    }

  }),
  mounted: async function () {
    this.settings.run = async () => store.dispatch('writeConfiguration', store.state.tome_app_config_path)

    store.state.tome_file_actions_root = [
      {
        name: 'New File',
        icon: 'mdi-file-star',
        action: (event) => {
          console.log('new file', event)
          this.add.value = ''
          this.add.relative_path = ''
          this.add.as_directory = false
          this.add.active = true
        }
      },
      {
        name: 'New Folder',
        icon: 'mdi-folder-star',
        action: (event) => {
          console.log('new folder', event)
          this.add.value = ''
          this.add.relative_path = ''
          this.add.as_directory = true
          this.add.active = true
        }
      },
      {
        name: 'Open Folder',
        icon: 'mdi-folder-move',
        action: (event) => {
          console.log('open folder', event)
          shell.openItem(store.state.tome.path)
        }
      }
    ]

    store.state.tome_file_actions = store.state.tome_file_actions_root

    store.state.tome_app_config_path_dir = path.join(remote.app.getPath('appData'), 'tome')

    let create_directory = false

    try {
      await new Promise((resolve, reject) => fs.lstat(store.state.tome_app_config_path_dir, (err, status) => err ? reject(err) : resolve(status)))
    } catch (err) {
      create_directory = true
    }

    if (create_directory) {
      const err = await new Promise((resolve, reject) => fs.mkdir(store.state.tome_app_config_path_dir, { recursive: true }, (err) => err ? reject(err) : resolve(true)))

      if (err) {
        console.error(`Failure to create Tome configuration folder at ${store.state.tome_app_config_path_dir}`)
      }
    }

    store.state.tome_app_config_path = path.join(store.state.tome_app_config_path_dir, 'config.json')

    let create_file = false

    try {
      await new Promise((resolve, reject) => fs.lstat(store.state.tome_app_config_path, (err, status) => err ? reject(err) : resolve(status)))
    } catch (err) {
      create_file = true
    }

    if (create_file) {
      const fd = await new Promise((resolve, reject) => fs.open(store.state.tome_app_config_path, 'w', (err, fd) => err ? reject(err) : resolve(fd)))
      await new Promise((resolve, reject) => fs.close(fd, (err) => err ? reject(err) : resolve(true)))
    }

    await store.dispatch('loadConfiguration', store.state.tome_app_config_path)
    console.log('configuration complete', this.configuration)
  },
  methods: {
    choose_tome: function (event) {
      this.$refs.tome.click()
    },
    open_commit: async function (event, test) {
      console.log('test!', event, test)
      this.commit = true
    },
    set_tome: async function (file_path) {
      await store.dispatch('load', file_path)
      this.reload_run()
    },
    action_new_file: async function (target_path) {
      console.log('new file', target_path)
      this.add.value = ''
      this.add.relative_path = target_path
      this.add.as_directory = false
      this.add.active = true
    },
    action_new_folder: async function (target_path) {
      console.log('new folder', target_path)
      this.add.value = ''
      this.add.relative_path = target_path
      this.add.as_directory = true
      this.add.active = true
    },
    action_open_folder: async function (path) {
      console.log('action_open_folder', path)
      shell.openItem(path)
    },
    counter_start: function (target) {
      clearTimeout(this[target].timeout)

      this[target].triggered = true
      this[target].counter = this[target].max

      this[target].timeout = setTimeout(() => this.counter_update(target), 500)
    },
    counter_update: async function (target) {
      if (!this[target].counter) {
        return this.counter_run(target)
      }

      this[target].counter = this[target].counter - 1

      if (this[target].counter >= 0) {
        this[target].timeout = setTimeout(() => this.counter_update(target), 1000)
      }
    },
    counter_run: async function (target) {
      clearTimeout(this[target].timeout)
      this[target].run()
      this[target].timeout = setTimeout(() => this.counter_clear(target), 1000)
    },
    counter_clear: async function (target) {
      clearTimeout(this[target].timeout)
      this[target].triggered = false
    },
    reload_start: function () {
      clearTimeout(this.reload.timeout)

      this.reload.triggered = true
      this.reload.counter = this.reload.max

      this.reload.timeout = setTimeout(this.reload_update, 500)
    },
    reload_update: async function () {
      if (!this.reload.counter) {
        return this.reload_run()
      }

      this.reload.counter = this.reload.counter - 1

      if (this.reload.counter >= 0) {
        this.reload.timeout = setTimeout(this.reload_update, 1000)
      }
    },
    reload_run: async function () {
      clearTimeout(this.reload.timeout)
      this.reload.triggered = false

      await store.dispatch('inspect')
    },
    open_context: async function (e, type, path) {
      console.log('open_context', e, type, path)

      this.context.visible = true
      this.context.title = `${type} - ${path}`
      this.context.target = path
      this.context.items = []
      this.context.position.x = e.clientX
      this.context.position.y = e.clientY

      switch (type) {
        case 'folder':
          this.context.items.push({
            title: 'Expand',
            action: () => { console.log('Expand Action!') }
          })
          // fall through

        case 'file':
          this.context.items.push({
            title: 'New File',
            action: this.action_new_file
          })

          this.context.items.push({
            title: 'New Folder',
            action: this.action_new_folder
          })

          this.context.items.push({
            title: 'Open Folder',
            action: this.action_open_folder
          })

          break
      }
    },
    reload_selected_explorer: function () {
      // TODO: Reimplement reload behavior for explorer
    },
    assign_key: async function (name, event) {
      const files = event.target.files || event.dataTransfer.files

      if (!files.length) {
        this[name] = null
        return
      }

      if (!files[0].path) {
        return
      }

      await store.dispatch('updateConfiguration', { [name]: files[0].path })
      this.counter_start('settings')
    }
  },
  computed: {
    tome_file_rendered: function () {
      return ''
    },
    tome_file_path_rel: function () {
      return store.state.tome_file_path ? `${path.relative(store.state.tome.path, store.state.tome_file_path)}${path.sep}` : ''
    },
    tome_path: function () {
      return store.state.tome.path
    },
    add_target: function () {
      return this.add.relative_path || store.state.tome_file_path
    },
    tome: function () {
      return store.state.tome
    },
    configuration: function () {
      return store.state.configuration
    }
  },
  components: {
    SystemBar,
    EditorInterface,
    ActionBar,
    NewFileService,
    ContextMenuService
  }
}
</script>
