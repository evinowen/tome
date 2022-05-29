<template>
  <v-app id="inspire">
    <system-bar title="tome" @settings="settings = !settings" />

    <settings v-model="settings" />

    <branch v-if=tome.loaded v-model=branch @close="branch = false" @patch="patch = true" />
    <commit ref="commit" v-if=tome.loaded v-model=commit @close="commit = false" @patch="patch = true" :confirm=commit_confirm @confirm="commit_confirm = $event" @push=quick_push />
    <push ref="push" v-if=tome.loaded v-model=push @close="push = false" @patch="patch = true" :confirm=push_confirm @confirm="push_confirm = $event" />

    <patch v-if=tome.loaded v-model=patch @close="patch = false" />

    <console v-model=console @close="console = false" />

    <editor-interface
      v-show=tome.path
      ref="interface"
      :edit=edit
      :commit=false
      :push=false
      @save=debounce_save
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
    <shortcut-service
      :settings=settings
      :patch=patch
      :search=search
      :edit=edit
      :branch=branch
      :commit=commit
      :push=push
      :console=console

      @settings="settings = !settings"
      @patch="patch = !patch"
      @search="search = !search"
      @edit="edit = !edit"
      @branch="branch = !branch"
      @commit="commit = edit ? !commit : false"
      @push="push = edit ? !push : false"
      @console="console = !console"

      @quick-commit=quick_commit
    />

    <action-bar
      :waiting=0
      :edit=edit
      :branch=branch
      :commit=commit
      :push=push
      :console=console
      :disabled="settings"
      @open=set_tome
      @close=clear_tome
      @edit=toggle
      @branch="branch = !branch"
      @commit="commit = !commit"
      @push="push = !push"
      @console="console = !console"
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
import { debounce } from 'lodash'

import ContextMenuService from './components/ContextMenuService.vue'
import SearchService from './components/SearchService.vue'

import { VApp } from 'vuetify/lib'
import SystemBar from './components/SystemBar.vue'
import Settings from './components/Settings.vue'
import Branch from './components/Branch.vue'
import Patch from './components/Patch.vue'
import Commit from './components/Commit.vue'
import Push from './components/Push.vue'
import Console from './components/Console.vue'
import EditorInterface from './components/EditorInterface.vue'
import EmptyView from '@/views/Empty.vue'
import ActionBar from './components/ActionBar.vue'
import ShortcutService from './components/ShortcutService.vue'

export default {
  props: {
    source: String
  },
  data: () => ({
    settings: false,
    branch: false,
    edit: false,
    patch: false,
    commit: false,
    commit_confirm: false,
    push: false,
    push_confirm: false,
    console: false,
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
  computed: {
    tome: function () {
      return store.state.tome
    },
    debounce_save: function () {
      return debounce(this.save, 1000)
    }
  },
  methods: {
    save: async function (state) {
      const { content } = state

      await store.dispatch('files/update', { content })
      await store.dispatch('files/save')
    },
    set_tome: async function (file_path) {
      await store.dispatch('library/add', file_path)
      await store.dispatch('tome/load', file_path)
      await store.dispatch('files/initialize', { path: file_path })
      store.dispatch('tome/inspect')
    },
    clear_tome: async function () {
      await store.dispatch('tome/clear')
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
    toggle: async function () {
      this.debounce_save.flush()
      this.edit = !this.edit
    },
    quick_commit: async function () {
      this.edit = true
      this.commit = true
      this.commit_confirm = true

      await store.dispatch('tome/stage', '*')

      this.$refs.commit.commit()
    },
    quick_push: async function () {
      this.push = true
      this.push_confirm = true

      const credentials = {
        private_key: store.state.configuration.private_key,
        public_key: store.state.configuration.public_key,
        passphrase: store.state.configuration.passphrase
      }

      await store.dispatch('tome/credentials', credentials)

      let url
      for (const remote of store.state.tome.remotes) {
        if (store.state.configuration.default_remote === remote.name) {
          url = remote.url
          break
        }
      }

      await store.dispatch('tome/remote', url)

      this.$refs.push.push()
    }
  },
  components: {
    VApp,
    SystemBar,
    Settings,
    Branch,
    Patch,
    Commit,
    Push,
    Console,
    EditorInterface,
    EmptyView,
    ActionBar,
    ContextMenuService,
    SearchService,
    ShortcutService
  }
}
</script>
