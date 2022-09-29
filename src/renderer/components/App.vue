<template>
  <v-app id="inspire">
    <system-bar title="tome" />
    <settings :value=system.settings />
    <template v-if=repository.loaded>
      <branch :value=system.branch />
      <commit ref="commit" />
      <push ref="push" />
      <patch :value=system.patch />
    </template>

    <editor-interface v-show=repository.path ref="interface" />
    <empty-pane v-show=!repository.path />

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

import ContextMenuService from '@/components/ContextMenuService'
import SearchService from '@/components/SearchService'

import { VApp } from 'vuetify/lib'
import SystemBar from '@/components/SystemBar'
import Settings from '@/components/Settings'
import Branch from '@/components/Branch'
import Patch from '@/components/Patch'
import Commit from '@/components/Commit'
import Push from '@/components/Push'
import Console from '@/components/Console'
import EditorInterface from '@/components/EditorInterface'
import EmptyPane from '@/components/EmptyPane'
import ActionBar from '@/components/ActionBar'
import ShortcutService from '@/components/ShortcutService'

export default {
  computed: {
    repository: function () {
      return store.state.repository
    },
    system: function () {
      return store.state.system
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
    EmptyPane,
    ActionBar,
    ContextMenuService,
    SearchService,
    ShortcutService
  }
}
</script>
