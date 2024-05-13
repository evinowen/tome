<template>
  <v-system-bar
    window
    height="25"
    class="pa-0"
    style="user-select: none;"
    color="surface"
  >
    <span
      class="system-bar-title"
      :style="{ opacity: (title ? 1 : 0.6)}"
    >{{ title || 'tome' }}</span>
    <v-btn
      rounded="0"
      variant="flat"
      size="small"
      class="system-bar-button"
      @click.stop="settings"
    >
      <svg
        :class="[
          'settings',
          rotate ? 'rotate' : '',
        ]"
        width="12"
        height="12"
        viewBox="0 0 127 127"
      >
        <g>
          <path
            d="
              M 63.5 0
              A 63.5 63.5 0 0 0 47.625 2.1342367 L 47.625 18.720821
              A 47.625 47.625 0 0 0 32.572172 27.312545 L 18.333765 19.092375
              A 63.5 63.5 0 0 0 2.3709147 46.537211 L 16.766935 54.849365
              A 47.625 47.625 0 0 0 15.875 63.5
              A 47.625 47.625 0 0 0 16.766935 72.150635 L 2.3709147 80.462789
              A 63.5 63.5 0 0 0 18.333765 107.90763 L 32.572172 99.687455
              A 47.625 47.625 0 0 0 47.625 108.27918 L 47.625 124.86576
              A 63.5 63.5 0 0 0 63.5 127
              A 63.5 63.5 0 0 0 79.375 124.86576 L 79.375 108.27918
              A 47.625 47.625 0 0 0 94.427828 99.687455 L 108.66624 107.90763
              A 63.5 63.5 0 0 0 124.62909 80.462789 L 110.23306 72.150635
              A 47.625 47.625 0 0 0 111.125 63.5
              A 47.625 47.625 0 0 0 110.31316 54.802856 L 124.66681 46.516024
              A 63.5 63.5 0 0 0 108.79853 19.015894 L 94.435579 27.308411
              A 47.625 47.625 0 0 0 79.375 18.602999 L 79.375 2.0267497
              A 63.5 63.5 0 0 0 63.5 0 z M 63.5 39.6875
              A 23.8125 23.8125 0 0 1 87.3125 63.5
              A 23.8125 23.8125 0 0 1 63.5 87.3125
              A 23.8125 23.8125 0 0 1 39.6875 63.5
              A 23.8125 23.8125 0 0 1 63.5 39.6875 z
              "
          />
        </g>
      </svg>
    </v-btn>
    <v-spacer />
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

const rotate = computed(() => {
  return store.state.system.settings
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

.system-bar-title {
  position: absolute;
  width: 100%;
  text-align: center;
}

.system-bar-button {
  position: relative;
  background: transparent;
  font-size: 1.2em;
  padding: 0px;
  height: 100%;
  width: 30px;
  min-height: 0;
  min-width: 30px;
}

@keyframes rotating {
  from{ transform: rotate(0deg); }
  to{ transform: rotate(360deg); }
}

.settings  {
  animation: rotating 2s linear infinite;
  animation-play-state: paused;
}

.settings path {
  fill: rgb(var(--v-theme-on-surface));
}

.settings.rotate  {
  animation-play-state: running;
}
</style>
