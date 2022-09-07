<template>
  <v-system-bar
    window
    height=25
    class="pa-0"
    style="user-select: none;"
  >
    <v-btn tile icon small @click.stop=settings>
      <v-icon>{{ icon }}</v-icon>
    </v-btn>
    <v-spacer></v-spacer>
    <span system-bar-title :style="{ opacity: (title ? 1 : 0.4)}">{{ title || 'tome' }}</span>
    <v-spacer></v-spacer>
    <v-btn tile icon small @click.stop="minimize" system-bar-minimize>
      <v-icon>mdi-window-minimize</v-icon>
    </v-btn>
    <v-btn tile icon small @click.stop="maximize" system-bar-maximize>
      <v-icon>{{ maximized ? "mdi-window-restore" : "mdi-window-maximize" }}</v-icon>
    </v-btn>
    <v-btn tile icon small @click.stop="close" system-bar-close>
      <v-icon>mdi-window-close</v-icon>
    </v-btn>
  </v-system-bar>
</template>

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

@-webkit-keyframes rotating {
  from{ -webkit-transform: rotate(0deg); }
  to{ -webkit-transform: rotate(360deg); }
}

.rotate .v-icon {
  -webkit-animation: rotating 2s linear infinite;
}
</style>

<script>
import { VBtn, VIcon, VSystemBar, VSpacer } from 'vuetify/lib'
import store from '@/store'

export default {
  components: { VBtn, VIcon, VSystemBar, VSpacer },
  data: () => ({
    maximized: false
  }),
  mounted: async function () {
    this.maximized = await window.api.is_window_maximized()
  },
  computed: {
    icon: function () {
      return store.state.system.settings ? 'mdi-spin mdi-cog' : 'mdi-circle-medium'
    },
    title: function () {
      return store.state.tome?.name || null
    }
  },
  methods: {
    settings: async function () {
      await store.dispatch('system/settings', !store.state.system.settings)
    },
    minimize: async function (event) {
      await window.api.minimize_window()

      this.$emit('minimized')
    },
    maximize: async function (event) {
      if (await window.api.is_window_maximized()) {
        await window.api.restore_window()
        this.maximized = false

        this.$emit('restored')
      } else {
        await window.api.maximize_window()
        this.maximized = true

        this.$emit('maximized')
      }
    },
    close: async function (event) {
      await window.api.close_window()

      this.$emit('closed')
    }

  }

}
</script>
