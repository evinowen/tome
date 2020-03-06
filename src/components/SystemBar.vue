<template>
  <v-system-bar
    window dark height=25
    color="grey darken-3"
    class="white--text pa-0"
    style="user-select: none;"
  >

    <v-btn tile icon small @click.stop="$emit('settings')" >
      <v-icon small>mdi-settings</v-icon>
    </v-btn>

    <v-spacer></v-spacer>

    <span system-bar-title>{{ title }}</span>

    <v-spacer></v-spacer>

    <v-btn tile icon small @click.stop="minimize" system-bar-minimize>
      <v-icon small>mdi-window-minimize</v-icon>
    </v-btn>

    <v-btn tile icon small @click.stop="maximize" system-bar-maximize>
      <v-icon small>{{ maximized ? "mdi-window-restore" : "mdi-window-maximize" }}</v-icon>
    </v-btn>

    <v-btn tile icon small @click.stop="close" system-bar-close>
      <v-icon small>mdi-window-close</v-icon>
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

.v-system-bar .v-icon {
  margin: 0 !important;
}

</style>

<script>
import { remote } from 'electron'

export default {
  props: {
    title: { type: String, default: '' }
  },

  data: () => ({
    maximized: false

  }),

  mounted: async function () {
    const window = remote.getCurrentWindow()

    this.maximized = window.isMaximized()
  },

  methods: {
    minimize: function (event) {
      const window = remote.BrowserWindow.getFocusedWindow()

      window.minimize()

      this.$emit('minimized')
    },

    maximize: function (event) {
      const window = remote.BrowserWindow.getFocusedWindow()

      if (window.isMaximized()) {
        window.restore()

        this.maximized = false

        this.$emit('restored')
      } else {
        window.maximize()

        this.maximized = true

        this.$emit('maximized')
      }
    },

    close: function (event) {
      const window = remote.BrowserWindow.getFocusedWindow()

      window.close()

      this.$emit('closed')
    }

  }

}
</script>
