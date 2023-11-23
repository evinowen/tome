<template>
  <v-app :theme="theme">
    <system-bar title="tome" />
    <action-bar />
    <settings :value="system.settings" />
    <v-main id="main">
      <console :value="system.console">
        <template v-if="repository.loaded">
          <branch :value="system.branch" />
          <commit ref="commit" />
          <push ref="push" />
          <patch :value="system.patch" />
        </template>

        <editor-interface
          v-show="repository.path"
          ref="interface"
        />
        <empty-pane v-show="!repository.path" />

        <context-menu-service />

        <search-service v-show="system.search" />
        <shortcut-service />
      </console>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Setup, toNative } from 'vue-facing-decorator'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'

import ContextMenuService from '@/components/ContextMenuService.vue'
import SearchService from '@/components/SearchService.vue'

import {
  VApp,
  VMain
} from 'vuetify/components'
import SystemBar from '@/components/SystemBar.vue'
import Settings from '@/components/Settings.vue'
import Branch from '@/components/Branch.vue'
import Patch from '@/components/Patch.vue'
import Commit from '@/components/Commit.vue'
import Push from '@/components/Push.vue'
import Console from '@/components/Console.vue'
import EditorInterface from '@/components/EditorInterface.vue'
import EmptyPane from '@/components/EmptyPane.vue'
import ActionBar from '@/components/ActionBar.vue'
import ShortcutService from '@/components/ShortcutService.vue'

@Component({
  components: {
    VApp,
    VMain,
    SystemBar,
    Settings,
    Branch,
    Patch,
    Commit,
    Push,
    Console,
    EditorInterface,
    EmptyPane,
    ActionBar,
    ContextMenuService,
    SearchService,
    ShortcutService
  }
})
class App extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  get repository () {
    return this.store.state.repository
  }

  get system () {
    return this.store.state.system
  }

  get theme () {
    return this.store.state.configuration.dark_mode ? "dark" : "light"
  }
}

export default toNative(App)
</script>

<style>
::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

::-webkit-scrollbar-corner {
  background: rgba(var(--v-theme-on-background), 0.1);
}

::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-on-background), 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-on-background), 0.1);
}

html, body {
  scrollbar-gutter: auto;
  overflow: hidden !important;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.v-application,
.v-application--wrap {
  overflow: hidden !important;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

#main {
  max-height: 100%;
}
</style>
