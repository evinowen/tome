<template>
  <utility-page
    right
    title="Theme Editor"
    :layer="11"
    :open="system.theme_editor"
    @close="close"
  >
    <template #options>
      <div class="d-flex ma-2">
        <div
          v-if="configuration.target === SettingsTarget.Global"
          class="target-badge-global px-4 d-flex align-center"
        >
          <v-icon class="mr-1">
            mdi-earth
          </v-icon>
          Global
        </div>
        <div
          v-if="configuration.target === SettingsTarget.Local"
          class="target-badge-local px-4 d-flex align-center"
        >
          <v-icon class="mr-1">
            mdi-book
          </v-icon>
          Local
        </div>
        <div class="flex-grow-1" />
        <div class="active-checkbox d-flex align-center mx-3 pr-3">
          <div
            class="mr-2"
            @click="active = !active"
          >
            <v-icon v-if="active">mdi-checkbox-marked</v-icon>
            <v-icon v-else>mdi-checkbox-blank-outline</v-icon>
          </div>
          Active Theme
        </div>
        <div class="d-flex align-center">
          <select-button-input
            :disabled="active"
            :options="theme_select_options"
            :value="theme_select"
            @update="(value) => theme_select = value"
          />
        </div>
      </div>
    </template>
    <v-tabs
      v-model="tab"
      align-tabs="center"
      stacked
    >
      <v-tab value="application">
        <v-icon>mdi-application-outline</v-icon>
        Application
      </v-tab>
      <v-tab value="rendered">
        <v-icon>mdi-note-text</v-icon>
        Rendered
      </v-tab>
      <v-tab value="compose">
        <v-icon>mdi-note-edit</v-icon>
        Compose
      </v-tab>
    </v-tabs>
    <v-window
      v-model="tab"
      class="flex-grow-1"
    >
      <v-window-item value="application">
        <application-theme-editor :theme="theme" />
      </v-window-item>
      <v-window-item value="rendered">
        <rendered-theme-editor :theme="theme" />
      </v-window-item>
      <v-window-item value="compose">
        <compose-theme-editor :theme="theme" />
      </v-window-item>
    </v-window>
  </utility-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import { fetch_fonts_store } from '@/store/modules/fonts'
import { fetch_system_store } from '@/store/modules/system'
import SelectButtonInput from '@/components/Input/SelectButtonInput.vue'
import ApplicationThemeEditor from './ThemeEditor/Sections/ApplicationThemeEditor.vue'
import RenderedThemeEditor from './ThemeEditor/Sections/RenderedThemeEditor.vue'
import ComposeThemeEditor from './ThemeEditor/Sections/ComposeThemeEditor.vue'
import UtilityPage from './UtilityPage.vue'
import {
  VIcon,
  VTab,
  VTabs,
  VWindow,
  VWindowItem,
} from 'vuetify/components'

const configuration = fetch_configuration_store()
const fonts = fetch_fonts_store()
const system = fetch_system_store()

const theme_select_options = [
  { value: 'dark', icon: 'mdi-weather-night' },
  { value: 'light', icon: 'mdi-weather-sunny' },
]

const tab = ref<string>('interface')
const theme_select = ref(configuration.active.dark_mode ? 'dark' : 'light')
const active = ref(true)

const theme = computed(() => {
  return active.value
    ? (configuration.active.dark_mode ? 'dark' : 'light')
    : theme_select.value
})

watch(() => system.theme_editor, async (value) => {
  if (value) {
    await fonts.hydrate()
    active.value = true
  }
})

watch(() => active.value, async (value) => {
  if (value) {
    theme_select.value = configuration.active.dark_mode ? 'dark' : 'light'
  }
})

async function close () {
  await system.page({ theme_editor: false })
}

defineExpose({
  active,
  theme,
  theme_select,
  close,
})
</script>

<style scoped>
:deep(.v-color-picker) {
  display: flex;
  flex-direction: column;
}

:deep(.v-color-picker-canvas) {
  flex-grow: 1;
  flex-shrink: 0;
  height: 256px;
}

:deep(v-color-picker__controls) {
  flex-grow: 0;
  flex-shrink: 0;
}

.target-badge-global {
  border-radius: 2px;
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}

.target-badge-local {
  display: inline;
  border-radius: 2px;
  background: rgb(var(--v-theme-secondary));
  color: rgb(var(--v-theme-on-secondary));
}

.active-checkbox {
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.2);
}

.tome-badge {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
  margin: auto;
  width: 200px;
  padding: 6px;
  text-align: center;
}

.tome-badge-logo {
  flex-grow: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tome-badge-data {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
</style>
