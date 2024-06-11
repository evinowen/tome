<template>
  <v-app
    id="app"
    class="app-root"
    :style="{
      '--font-application-title': computed_theme.application.font_family_title,
      '--font-application-title-size': `${computed_theme.application.font_size_title}em`,
      '--font-application-content': computed_theme.application.font_family_content,
      '--font-application-content-size': `${computed_theme.application.font_size_content}em`,
      '--font-application-monospace': computed_theme.application.font_family_monospace || 'monospace',
      '--font-application-monospace-size': `${computed_theme.application.font_size_monospace}em`,
      '--font-rendered-header': computed_theme.rendered.font_family_header,
      '--font-rendered-header-size': `${computed_theme.rendered.font_size_header}em`,
      '--font-rendered-content': computed_theme.rendered.font_family_content,
      '--font-rendered-content-size': `${computed_theme.rendered.font_size_content}em`,
      '--font-compose': computed_theme.compose.font_family_compose || 'monospace',
      '--font-compose-size': `${computed_theme.compose.font_size_compose || 1}em`,
    }"
    :theme="theme"
    @scroll.self="scroll"
  >
    <system-bar title="tome" />
    <action-bar />
    <v-main class="app-main">
      <div class="app-container">
        <settings />
        <theme-editor />
        <console />

        <template v-if="repository.ready">
          <branches />
          <commit />
          <history />
          <patch />
          <push />
          <remotes />
          <tags />
        </template>

        <editor-interface />

        <password-box />
        <error-box />
        <validation-box />

        <context-menu-service />
        <search-service v-show="system.search" />
        <shortcut-service />
        <timer-service />

        <select-input-overlay />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import ActionBar from '@/components/ActionBar.vue'
import Branches from '@/components/Branches.vue'
import Commit from '@/components/Commit.vue'
import Console from '@/components/Console.vue'
import ContextMenuService from '@/components/ContextMenuService.vue'
import EditorInterface from '@/components/EditorInterface.vue'
import ErrorBox from '@/components/ErrorBox.vue'
import History from '@/components/History.vue'
import PasswordBox from '@/components/PasswordBox.vue'
import Patch from '@/components/Patch.vue'
import Push from '@/components/Push.vue'
import Remotes from '@/components/Remotes.vue'
import SearchService from '@/components/SearchService.vue'
import SelectInputOverlay from '@/components/Input/Overlays/SelectInputOverlay.vue'
import Settings from '@/components/Settings.vue'
import ShortcutService from '@/components/ShortcutService.vue'
import SystemBar from '@/components/SystemBar.vue'
import Tags from '@/components/Tags.vue'
import ThemeEditor from '@/components/ThemeEditor.vue'
import TimerService from '@/components/TimerService.vue'
import ValidationBox from '@/components/ValidationBox.vue'
import {
  VApp,
  VMain,
} from 'vuetify/components'

import { computed, nextTick, onMounted, ref, watchEffect } from 'vue'
import { fetch_application_store, ApplicationStage } from '@/store/modules/application'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_repository_store } from '@/store/modules/repository'
import { fetch_system_store } from '@/store/modules/system'

const application = fetch_application_store()
const configuration = fetch_configuration_store()
const repository = fetch_repository_store()
const system = fetch_system_store()

const theme = computed(() => configuration.active.dark_mode ? 'dark' : 'light')
const computed_theme = computed(() => configuration.active.themes[theme.value])

const scroll = (event) => {
  event.target.scrollTop = 0
}

const ready = ref(false)
onMounted(async () => {
  await nextTick()
  ready.value = true
})

watchEffect(async () => {
  if (ready.value) {
    await application.present(ApplicationStage.Application)
  }
})

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
  background-image:
    repeating-linear-gradient(
      45deg,
      rgba(var(--v-theme-on-background), 0.075),
      rgba(var(--v-theme-on-background), 0.075) 3px,
      rgba(var(--v-theme-on-background), 0.025) 3px,
      rgba(var(--v-theme-on-background), 0.025) 7.25px
    );
}

.app-root {
  font-family: var(--font-application-content);
  font-size: var(--font-application-content-size);
}

.app-root :deep(.title) {
  font-family: var(--font-application-title) !important;
  font-size: var(--font-application-title-size);
}

.app-root :deep(pre) {
  font-family: var(--font-application-monospace);
  font-size: var(--font-application-monospace-size);
}

.app-main {
  max-height: 100%;
}

.app-container {
  height: 100%;
  position: relative;
}
</style>
