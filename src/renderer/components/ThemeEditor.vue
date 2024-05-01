<template>
  <utility-page
    right
    title="Theme Editor"
    :layer="11"
    :open="system.theme_editor"
    @close="close"
  >
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
        <application-theme-editor />
      </v-window-item>
      <v-window-item value="rendered">
        <rendered-theme-editor />
      </v-window-item>
      <v-window-item value="compose">
        <compose-theme-editor />
      </v-window-item>
    </v-window>
  </utility-page>
</template>

<script lang="ts">
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

export default {
  components: {
    ApplicationThemeEditor,
    RenderedThemeEditor,
    ComposeThemeEditor,
    UtilityPage,
    VIcon,
    VTab,
    VTabs,
    VWindow,
    VWindowItem,
  },
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

const tab = ref<string>('interface')

const system = computed(() => store.state.system)

async function close () {
  await store.dispatch('system/theme_editor', false)
}

defineExpose({
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
