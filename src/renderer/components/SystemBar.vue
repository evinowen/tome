<template>
  <v-system-bar
    window
    height="25"
    class="pa-0"
    style="user-select: none;"
    color="surface"
  >
    <v-btn
      rounded="0"
      variant="flat"
      size="small"
      class="system-bar-button"
      @click.stop="settings"
    >
      <v-icon>{{ icon }}</v-icon>
    </v-btn>
    <v-spacer />
    <span
      system-bar-title
      :style="{ opacity: (title ? 1 : 0.6)}"
    >{{ title || 'tome' }}</span>
    <v-spacer />
    <v-btn
      rounded="0"
      variant="flat"
      size="small"
      class="system-bar-button"
      system-bar-minimize
      @click.stop="minimize"
    >
      <v-icon>mdi-window-minimize</v-icon>
    </v-btn>
    <v-btn
      rounded="0"
      variant="flat"
      size="small"
      class="system-bar-button"
      system-bar-maximize
      @click.stop="maximize"
    >
      <v-icon>{{ maximized ? "mdi-window-restore" : "mdi-window-maximize" }}</v-icon>
    </v-btn>
    <v-btn
      rounded="0"
      variant="flat"
      size="small"
      class="system-bar-button"
      system-bar-close
      @click.stop="exit"
    >
      <v-icon>mdi-window-close</v-icon>
    </v-btn>
  </v-system-bar>
</template>

<script lang="ts">
import {
  VBtn,
  VIcon,
  VSpacer,
  VSystemBar,
} from 'vuetify/components'

export default {
  components: {
    VBtn,
    VIcon,
    VSpacer,
    VSystemBar,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

const maximized = computed(() => {
  return store.state.system.maximized
})

const icon = computed(() => {
  return store.state.system.settings ? 'mdi-spin mdi-cog' : 'mdi-circle-medium'
})

const title = computed(() => {
  return store.state.repository?.name || undefined
})

async function settings () {
  await store.dispatch('system/theme_editor', false)
  await store.dispatch('system/settings', !store.state.system.settings)
}

async function minimize () {
  await store.dispatch('system/minimize')
}

async function maximize () {
  maximized.value
    ? await store.dispatch('system/restore')
    : await store.dispatch('system/maximize')
}

async function exit () {
  await store.dispatch('system/exit')
}

defineExpose({
  exit,
  maximize,
  minimize,
  settings,
})
</script>

<style scoped>
.v-system-bar {
  font-family: var(--font-title);
  -webkit-app-region: drag;
}

.v-system-bar button {
  -webkit-app-region: no-drag;
}

@keyframes rotating {
  from{ transform: rotate(0deg); }
  to{ transform: rotate(360deg); }
}

.rotate .v-icon {
  animation: rotating 2s linear infinite;
}

.system-bar-button {
  background: transparent;
  font-size: 1.2em;
  padding: 0px;
  height: 100%;
  width: 30px;
  min-height: 0;
  min-width: 30px;
}
</style>
