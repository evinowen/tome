<template>
  <v-app
    id="app"
    class="app-root"
    :style="{
      '--font-title': theme.application.font_family_title,
      '--font-title-size': `${theme.application.font_size_title}em`,
      '--font-content': theme.application.font_family_content,
      '--font-content-size': `${theme.application.font_size_content}em`,
      '--font-monospace': theme.application.font_family_monospace || 'monospace',
      '--font-monospace-size': `${theme.application.font_size_monospace}em`,
    }"
    :theme="theme.name"
    @scroll.self="scroll"
  >
    <system-bar title="tome" />
    <action-bar />
    <v-main class="app-main">
      <div class="app-container">
        <settings />
        <theme-editor />
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
import ThemeEditor from '@/components/ThemeEditor.vue'
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
    ThemeEditor,
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

const theme = computed(() => {
  return store.state.configuration.dark_mode
    ? { name: 'dark', ...store.state.configuration.themes.dark }
    : { name: 'light', ...store.state.configuration.themes.light }
})

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
  font-family: 'Montserrat';
}

.app-root {
  font-family: var(--font-content);
  font-size: var(--font-content-size);
}

.app-root :deep(.title) {
  font-family: var(--font-title) !important;
  font-size: var(--font-title-size) !important;
}

.app-root :deep(pre) {
  font-family: var(--font-monospace);
  font-size: var(--font-monospace-size);
}

.app-main {
  max-height: 100%;
}

.app-container {
  height: 100%;
  position: relative;
}
</style>
