<template>
  <v-system-bar
    window
    height="25"
    class="pa-0"
    style="user-select: none;"
  >
    <v-btn
      tile
      icon
      small
      @click.stop="settings"
    >
      <v-icon>{{ icon }}</v-icon>
    </v-btn>
    <v-spacer />
    <span
      system-bar-title
      :style="{ opacity: (title ? 1 : 0.4)}"
    >{{ title || 'tome' }}</span>
    <v-spacer />
    <v-btn
      tile
      icon
      small
      system-bar-minimize
      @click.stop="minimize"
    >
      <v-icon>mdi-window-minimize</v-icon>
    </v-btn>
    <v-btn
      tile
      icon
      small
      system-bar-maximize
      @click.stop="maximize"
    >
      <v-icon>{{ maximized ? "mdi-window-restore" : "mdi-window-maximize" }}</v-icon>
    </v-btn>
    <v-btn
      tile
      icon
      small
      system-bar-close
      @click.stop="exit"
    >
      <v-icon>mdi-window-close</v-icon>
    </v-btn>
  </v-system-bar>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { VBtn, VIcon, VSystemBar, VSpacer } from 'vuetify/lib'
import store from '@/store'

export const SystemBarProperties = Vue.extend({})

@Component({
  components: { VBtn, VIcon, VSystemBar, VSpacer }
})
export default class SystemBar extends SystemBarProperties {
  get maximized () {
    return store.state.system.maximized
  }

  get icon () {
    return store.state.system.settings ? 'mdi-spin mdi-cog' : 'mdi-circle-medium'
  }

  get title () {
    return store.state.repository?.name || undefined
  }

  async settings () {
    await store.dispatch('system/settings', !store.state.system.settings)
  }

  async minimize () {
    await store.dispatch('system/minimize')
  }

  async maximize () {
    this.maximized
      ? await store.dispatch('system/restore')
      : await store.dispatch('system/maximize')
  }

  async exit () {
    await store.dispatch('system/exit')
  }
}
</script>

<style scoped>
.v-system-bar {
  -webkit-app-region: drag;
}

.v-system-bar button {
  -webkit-app-region: no-drag;
}

.v-system-bar .v-btn,
.v-system-bar .v-btn .v-icon {
  margin: 0 !important;
  font-size: 12px;
  height: 25px;
  width: 25px;
}

@keyframes rotating {
  from{ transform: rotate(0deg); }
  to{ transform: rotate(360deg); }
}

.rotate .v-icon {
  animation: rotating 2s linear infinite;
}
</style>
