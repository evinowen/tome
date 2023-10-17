<template>
  <v-system-bar
    window
    height="25"
    class="pa-0"
    style="user-select: none;"
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
import { Component, Vue, Setup, toNative } from 'vue-facing-decorator'
import { VBtn, VIcon, VSystemBar, VSpacer } from 'vuetify/components'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'

@Component({
  components: { VBtn, VIcon, VSystemBar, VSpacer }
})
class SystemBar extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  get maximized () {
    return this.store.state.system.maximized
  }

  get icon () {
    return this.store.state.system.settings ? 'mdi-spin mdi-cog' : 'mdi-circle-medium'
  }

  get title () {
    return this.store.state.repository?.name || undefined
  }

  async settings () {
    await this.store.dispatch('system/settings', !this.store.state.system.settings)
  }

  async minimize () {
    await this.store.dispatch('system/minimize')
  }

  async maximize () {
    this.maximized
      ? await this.store.dispatch('system/restore')
      : await this.store.dispatch('system/maximize')
  }

  async exit () {
    await this.store.dispatch('system/exit')
  }
}

export default toNative(SystemBar)
</script>

<style scoped>
.v-system-bar {
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
