<template>
  <v-navigation-drawer
    :value="value"
    fixed
    right
    stateless
    width="100%"
    style="z-index: 110; max-width: 900px; height: auto; top: 25px; bottom: 18px;"
    @input="$event || close"
  >
    <v-container
      fluid
      class="pb-0"
      style="height: 100%;"
    >
      <div
        class="d-flex flex-column align-stretch flex-grow-0"
        style="height: 100%;"
      >
        <div class="flex-grow-0">
          <div>
            <v-btn
              tile
              icon
              class="float-right"
              color="black"
              @click.stop="close"
            >
              <v-icon>mdi-window-close</v-icon>
            </v-btn>
            <h1><span class="header-pre float-left">{{ repository.patches_type }}</span>{{ repository.patches_reference }}</h1>
            <div style="clear: both; font-size: 1.15em; font-family: 'Courier New', Courier, monospace; margin-bottom: 6px">
              {{ repository.patches_message }}
            </div>
          </div>
          <div style="clear: both" />
        </div>

        <div class="flex-grow-1 mb-3">
          <div
            v-for="(file, file_index) in patches"
            :key="file_index"
            :class="[ file_index ? 'mt-4' : '']"
          >
            <v-card
              dense
              style="font-family: monospace; overflow: auto;"
            >
              <v-card-title class="pa-2">
                {{ file.name }}
              </v-card-title>
              <v-card-text class="pa-2">
                <div
                  v-for="(line, line_index) in file.lines"
                  :key="line_index"
                  :class="['line', line_color(line.type)]"
                >
                  <pre style="overflow: wrap">{{ line_prefix(line.type) }}{{ line.line }}</pre>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <div
          ref="base"
          class="flex-grow-0 pb-3 actions"
        >
          <v-divider class="mt-0 mb-2" />
          <v-btn
            small
            color="primary"
            @click.stop="close"
          >
            Done
          </v-btn>
        </div>
      </div>
    </v-container>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { VContainer, VNavigationDrawer, VDivider, VBtn, VIcon, VCard, VCardTitle, VCardText } from 'vuetify/lib'

import store from '@/store'

class RepositoryPatch {
  static LineType = {
    CONTEXT: 32,
    ADDITION: 43,
    DELETION: 45,
    CONTEXT_EOFNL: 61,
    ADD_EOFNL: 62,
    DEL_EOFNL: 60,
    FILE_HDR: 70,
    HUNK_HDR: 72,
    BINARY: 66
  }
}

export const PatchProperties = Vue.extend({
  props: {
    value: { type: Boolean, default: false }
  }
})

@Component({
  components: { VContainer, VNavigationDrawer, VDivider, VBtn, VIcon, VCard, VCardTitle, VCardText }
})
export default class Patch extends PatchProperties {
  get repository () {
    return store.state.repository
  }

  get patches () {
    return store.state.repository.patches
  }

  async close () {
    await store.dispatch('system/patch', false)
  }

  line_color (type) {
    switch (type) {
      case RepositoryPatch.LineType.HUNK_HDR:
        return 'blue--text'
      case RepositoryPatch.LineType.ADDITION:
        return 'green--text'
      case RepositoryPatch.LineType.DELETION:
        return 'red--text'
      default:
        return ''
    }
  }

  line_prefix (type) {
    switch (type) {
      case RepositoryPatch.LineType.HUNK_HDR:
        return ''
      case RepositoryPatch.LineType.ADDITION:
        return '+ '
      case RepositoryPatch.LineType.DELETION:
        return '- '
      default:
        return '  '
    }
  }
}
</script>

<style scoped>
.line {
  width: 100%;
  overflow: wrap;
}

pre {
  display: inline-block;
}

.header-pre {
  display: inline-block;
  vertical-align: bottom;
  color: black;
  line-height: 30px;
  font-size: 0.7em;
  padding-right: 8px;
}

.actions {
  backdrop-filter: blur(2px);
  position: sticky;
  bottom: 0px
}
</style>
