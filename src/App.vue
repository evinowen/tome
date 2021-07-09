<template>
  <v-app id="inspire">
    <system-bar title="tome" @settings="settings.open = !settings.open" />

    <settings v-model="settings.open" />

    <patch v-if=tome.loaded v-model=patch @close="patch = false" />
    <commit v-if=tome.loaded v-model=commit @close="commit = false" @patch="patch = true" />
    <push v-if=tome.loaded v-model=push @close="push = false" @patch="patch = true" />

    <editor-interface
      v-show=tome.path
      ref="interface"
      :edit=edit
      :commit=false
      :push=false
      @save="save"
      @context=open_context
    />
    <empty-view v-show=!tome.path />

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
      :disabled="settings.open"
      @open=set_tome
      @edit=toggle
      @commit="commit = !commit"
      @push="push = !push"
      @search="search = !search"
    />
  </v-app>
</template>

<style>
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-corner {
  background: rgba(0,0,0,0.05);
}

::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.05);
}

::-webkit-scrollbar-thumb {
  background: var(--v-secondary-lighten3);
}

html, body {
  font-size: 12px !important;
  overflow: hidden !important;
}

.v-application {
  font-family: "Montserrat" !important;
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

import ContextMenuService from './components/ContextMenuService.vue'
import SearchService from './components/SearchService.vue'

import SystemBar from './components/SystemBar.vue'
import Settings from './components/Settings.vue'
import Patch from './components/Patch.vue'
import Commit from './components/Commit.vue'
import Push from './components/Push.vue'
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
    patch: false,
    commit: false,
    push: false,
    search: false,

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
    this.editor.run = async () => {
      await store.dispatch('files/save')
      store.dispatch('tome/inspect')
    }
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
    tome: function () {
      return store.state.tome
    },
    configuration: function () {
      return store.state.configuration
    }
  },
  components: {
    SystemBar,
    Settings,
    Patch,
    Commit,
    Push,
    EditorInterface,
    EmptyView,
    ActionBar,
    ContextMenuService,
    SearchService
  }
}
</script>
