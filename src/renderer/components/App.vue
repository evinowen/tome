<template>
  <v-app
    class="app-root"
    :theme="theme"
    @scroll.self="scroll"
  >
    <system-bar title="tome" />
    <action-bar />
    <v-main class="app-main">
      <div class="app-container">
        <settings />
        <console />

        <template v-if="repository.loaded">
          <branch />
          <push />
          <commit />
          <patch />
        </template>

        <editor-interface v-show="repository.path" />
        <empty-pane v-show="!repository.path" />

        <context-menu-service />

        <search-service v-show="system.search" />
        <shortcut-service />
      </div>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import ActionBar from '@/components/ActionBar.vue'
import Branch from '@/components/Branch.vue'
import Commit from '@/components/Commit.vue'
import Console from '@/components/Console.vue'
import ContextMenuService from '@/components/ContextMenuService.vue'
import EditorInterface from '@/components/EditorInterface.vue'
import EmptyPane from '@/components/EmptyPane.vue'
import Patch from '@/components/Patch.vue'
import Push from '@/components/Push.vue'
import SearchService from '@/components/SearchService.vue'
import Settings from '@/components/Settings.vue'
import ShortcutService from '@/components/ShortcutService.vue'
import SystemBar from '@/components/SystemBar.vue'
import {
  VApp,
  VMain,
} from 'vuetify/components'

export default {
  components: {
    ActionBar,
    Branch,
    Commit,
    Console,
    ContextMenuService,
    EditorInterface,
    EmptyPane,
    Patch,
    Push,
    SearchService,
    Settings,
    ShortcutService,
    SystemBar,
    VApp,
    VMain,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

const repository = computed(() => store.state.repository)

const system = computed(() => store.state.system)

const theme = computed(() => store.state.configuration.dark_mode ? 'dark' : 'light')

const scroll = (event) => {
  event.target.scrollTop = 0
}

defineExpose({
  scroll,
})
</script>

<style scoped>
.app-root {
  overflow: hidden;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.app-main {
  max-height: 100%;
}

.app-container {
  height: 100%;
  position: relative;
}
</style>
