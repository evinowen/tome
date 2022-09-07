<template>
  <v-app id="inspire">
    <system-bar title="tome" />
    <settings :value=system.settings />
    <template v-if=tome.loaded>
      <branch :value=system.branch />
      <commit ref="commit" :value=system.commit />
      <push ref="push" :value=system.push />
      <patch :value=system.patch />
    </template>

    <editor-interface
      v-show=tome.path
      ref="interface"
      :edit=system.edit
      :commit=false
      :push=false
      @save=debounce_save
    />
    <empty-view v-show=!tome.path />

    <context-menu-service />

    <search-service v-show=system.search />
    <shortcut-service />

    <console :value=system.console />
    <action-bar />
  </v-app>
</template>

<style>
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-corner {
  background: rgba(0,0,0,0.1);
}

::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.1);
}

::-webkit-scrollbar-thumb {
  background: var(--v-secondary-lighten3);
}

html, body {
  scrollbar-gutter: auto;
  font-size: 12px !important;
  overflow: hidden !important;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.v-application,
.v-application--wrap {
  font-family: "Montserrat" !important;
  overflow: hidden !important;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.v-icon.v-icon {
  font-size: 18px;

}
</style>

<script>
import store from '@/store'
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
    error: null
  }),
  computed: {
    tome: function () {
      return store.state.tome
    },
    system: function () {
      return store.state.system
    },
    debounce_save: function () {
      return debounce(this.save, 1000)
    }
  },
  methods: {
    save: async function (state) {
      const { path, content } = state

      await store.dispatch('files/save', { path, content })
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
