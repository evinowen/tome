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
            <v-btn tile icon small :color="configuration.private_key ? 'green' : 'red'" class="key-input" @click.stop="$refs.private_key.click()">
              <v-icon small>{{ configuration.private_key ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
              {{ configuration.private_key }}
            </v-btn>
          </v-container>
        </v-list-item>
        <v-list-item>
          <v-container class="pa-0 mb-2">
            <div class="overline">Public Key</div>
            <input ref="public_key" type="file" style="display: none" @change="assign_key('public_key', $event)" />
            <v-btn tile icon small :color="configuration.public_key ? 'green' : 'red'" class="key-input" @click.stop="$refs.public_key.click()">
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
              <v-icon>mdi-content-save</v-icon>
            </v-avatar>
          </v-layout>
        </v-container>
      </template>
    </v-navigation-drawer>

    <editor-interface
      v-show=tome.path
      ref="interface"
      :edit=edit
      :commit=commit
      :push=push
      @save="save"
      @commit:close="commit = false"
      @push:close="push = false"
      @context=open_context
    />
    <empty-view v-show=!tome.path />

    <new-file-service
      :active="add.active"
      @close="add.active = false"
      :base="tome.path" :target="add_target"
      :extension="add.as_directory ? null : 'md'"
      :folder="add.as_directory"
    />

    <context-menu-service
      v-model=context.visible
      @close="context.visible = false"
      :title=context.title
      :target=context.target
      :items=context.items
      :position_x=context.position.x
      :position_y=context.position.y
    />

    <search-service v-show=search />

    <action-bar
      :waiting=editor.counter
      :commit=commit
      :push=push
      @open=set_tome
      @edit=toggle
      @commit="commit = true"
      @push="push = true"
      @search="search = !search"
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
import { remote } from 'electron'

import NewFileService from './components/NewFileService.vue'
import ContextMenuService from './components/ContextMenuService.vue'
import SearchService from './components/SearchService.vue'

import SystemBar from './components/SystemBar.vue'
import EditorInterface from './components/EditorInterface.vue'
import EmptyView from '@/views/Empty.vue'
import ActionBar from './components/ActionBar.vue'

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

    editor: {
      triggered: false,
      counter: 0,
      max: 3
    },

    edit: false,
    commit: false,
    push: false,
    search: false,

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
      position: { x: 0, y: 0 },
      options: {}
    },

    error: null

  }),

  created: function () {
    this.fs = remote.require('fs')
    this.path = remote.require('path')
  },

  mounted: async function () {
    this.settings.run = async () => store.dispatch('configuration/write', store.state.tome_app_config_path)
    this.editor.run = async () => {
      await store.dispatch('files/save')
      store.dispatch('tome/inspect')
    }

    store.state.tome_app_config_path_dir = this.path.join(remote.app.getPath('appData'), 'tome')

    let create_directory = false

    try {
      await new Promise((resolve, reject) => this.fs.lstat(store.state.tome_app_config_path_dir, (err, status) => err ? reject(err) : resolve(status)))
    } catch (err) {
      create_directory = true
    }

    if (create_directory) {
      try {
        await new Promise((resolve, reject) => this.fs.mkdir(store.state.tome_app_config_path_dir, { recursive: true }, (err) => err ? reject(err) : resolve(true)))
      } catch (error) {
        this.error = error
        return
      }
    }

    store.state.tome_app_config_path = this.path.join(store.state.tome_app_config_path_dir, 'config.json')

    let create_file = false

    try {
      await new Promise((resolve, reject) => this.fs.lstat(store.state.tome_app_config_path, (err, status) => err ? reject(err) : resolve(status)))
    } catch (err) {
      create_file = true
    }

    if (create_file) {
      try {
        const fd = await new Promise((resolve, reject) => this.fs.open(store.state.tome_app_config_path, 'w', (err, fd) => err ? reject(err) : resolve(fd)))
        await new Promise((resolve, reject) => this.fs.close(fd, (err) => err ? reject(err) : resolve(true)))
      } catch (error) {
        this.error = error
        return
      }
    }

    await store.dispatch('configuration/load', store.state.tome_app_config_path)
  },
  methods: {
    save: async function (state) {
      const { content } = state

      await store.dispatch('files/update', { content })

      if (this.edit) {
        this.counter_start('editor')
      } else {
        this.counter_run('editor', false)
      }
    },
    set_tome: async function (file_path) {
      await store.dispatch('tome/load', file_path)
      await store.dispatch('files/initialize', { path: file_path })
      store.dispatch('tome/inspect')
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

      this[target].timeout = setTimeout(() => this.counter_update(target), 1000)
    },
    counter_run: async function (target, clear = true) {
      clearTimeout(this[target].timeout)

      this[target].counter = 0
      await this[target].run()

      if (clear) {
        this[target].timeout = setTimeout(() => this.counter_clear(target), 1000)
      }
    },
    counter_clear: async function (target) {
      clearTimeout(this[target].timeout)

      this[target].counter = 0
      this[target].triggered = false
    },
    open_context: async function (state) {
      const { instance, selection, event } = state

      const data = {}

      this.context.title = ' ಠ_ಠ '

      delete this.context.target
      delete this.context.items

      if (instance) {
        instance.$emit('input', instance)
        data.title = instance.path
        data.target = instance.path
        data.items = instance.context
      }

      if (selection) {
        data.title = 'Content'
        data.items = selection.context
      }

      Object.assign(this.context, {
        visible: true,
        position: { x: event.clientX, y: event.clientY },
        ...data
      })
    },
    proxy_file: function (event) {
      const files = event.target.files || event.dataTransfer.files

      return files.length ? files[0] : null
    },
    assign_key: async function (name, event) {
      const file = this.proxy_file(event)

      await store.dispatch('configuration/update', { [name]: file.path })
      this.counter_start('settings')
    },
    toggle: async function (value) {
      if (value) {
        await this.counter_clear('editor')
      } else {
        await this.counter_run('editor', false)
      }

      this.edit = value
    }
  },
  computed: {
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
    EmptyView,
    ActionBar,
    NewFileService,
    ContextMenuService,
    SearchService
  }
}
</script>
