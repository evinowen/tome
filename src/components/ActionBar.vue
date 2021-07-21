<template>
  <v-footer
    app
    class="pa-0"
    height=18
  >
    <library-button v-model=library @open=open @close="$emit('close')" :disabled="disabled_unless()" />

    <v-divider inset vertical />

    <template v-if="tome.path">
      <v-menu top offset-y transition="slide-y-reverse-transition">

        <template v-slot:activator="{ on: on_click }">
          <v-tooltip top>
            <template v-slot:activator="{ on: on_hover }">
              <v-btn tile small class="button pa-0 px-2" v-on="{ ...on_hover, ...on_click }" :disabled="disabled_unless()">
                {{ tome.name }}
              </v-btn>
            </template>

            <span>{{ tome.path }}</span>

          </v-tooltip>
        </template>

        <v-list dense>
          <v-list-item
            v-for="(item, index) in menu"
            :key="index" dense
            @click.stop="$emit('menu', item.key)"
          >
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ item.text }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>

      </v-menu>

      <v-divider inset vertical />

      <v-btn v-if="tome.branch" tile small class="button px-2" color="primary" :disabled="disabled_unless(branch)">
        {{ tome.branch }}
      </v-btn>
      <v-btn v-else-if="tome.branch.error" tile small icon class="button pl-1 pr-2" color="error">
        <v-icon small class="pr-1">mdi-alert-box</v-icon>
        {{ tome.branch.error }}
      </v-btn>

      <v-divider inset vertical />

      <v-spacer class="crawling">&nbsp;<v-icon small>mdi-chevron-right</v-icon>&nbsp;{{ status }}</v-spacer>

      <v-divider inset vertical />

      <v-switch action-bar-edit v-model="edit" dense x-small inset hide-details class="edit_switch" :disabled="disabled_unless()"></v-switch>

      <v-divider inset vertical />

      <v-expand-x-transition>
        <div v-show="edit" style="overflow: hidden;">
          <div style="height: 18px">

            <!-- STAGE BUTTON -->
            <status-button
              :waiting="waiting"
              :available_new="tome.status.available.new"
              :available_renamed="tome.status.available.renamed"
              :available_modified="tome.status.available.modified"
              :available_removed="tome.status.available.deleted"
              :staged_new="tome.status.staged.new"
              :staged_renamed="tome.status.staged.renamed"
              :staged_modified="tome.status.staged.modified"
              :staged_removed="tome.status.staged.deleted"
            />

            <!-- SAVE BUTTON -->
            <v-btn action-bar-commit tile small icon color="primary" class="button pa-0" @click.stop="$emit('commit')" :disabled="disabled_unless(commit)">
              <v-icon small>mdi-content-save</v-icon>
            </v-btn>

            <!-- PUSH BUTTON -->
            <v-btn action-bar-push tile small icon color="primary" class="button pa-0" @click.stop="$emit('push')" :disabled="disabled_unless(push)">
              <v-icon small>mdi-upload-multiple</v-icon>
            </v-btn>

          </div>
        </div>
      </v-expand-x-transition>

      <v-divider inset vertical />

      <!-- SEARCH BUTTON -->
      <v-btn action-bar-search tile small icon color="primary" class="button pa-0" @click.stop="$emit('search')" :disabled="disabled_unless()">
        <v-icon small>mdi-magnify</v-icon>
      </v-btn>

    </template>

  </v-footer>
</template>

<style>
.edit_switch {
  padding-top: 2px !important;
  margin: 0 !important;
}

.edit_switch .v-input--selection-controls__input {
  height: 16px;
  margin-left: 5px !important;
  margin-right: 0 !important;
}

.edit_switch .v-input--selection-controls__ripple {
  top: calc(50% - 7px) !important;
  width: 12px !important;
  height: 12px !important;
  margin: 0px 11px !important;
}

.edit_switch .v-input--selection-controls__input {
  width: 36px !important;
}

.edit_switch .v-input--switch__track {
  top: calc(50% - 8px) !important;
  height: 14px !important;
  width: 36px !important;
}

.edit_switch .v-input--switch__thumb {
  top: calc(50% - 6px) !important;
  width: 10px !important;
  height: 10px !important;
}

.v-divider--vertical.v-divider--inset {
  margin-top: 3px;
  max-height: calc(100% - 8px) !important;

}

.v-btn--icon.v-size--small,
.v-btn--icon.v-size--small .v-icon {
  height: 18px;

}

.button {
  height: 18px !important;

}

.crawling {
  padding: 0 4px;
  font-size: 0.8em;
}

</style>

<script>
import store from '@/store'
import { remote } from 'electron'
import StatusButton from './StatusButton.vue'
import LibraryButton from './LibraryButton.vue'

export default {
  props: {
    menu: { type: Array, default: () => [] },
    waiting: { type: Number, default: 0 },
    waiting_max: { type: Number, default: 3 },
    commit: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },

  data: () => ({
    edit: false,
    library: false
  }),

  watch: {
    edit: function (value) { this.$emit('edit', value) }
  },

  methods: {
    open: async function (event) {
      this.library = false

      const window = remote.BrowserWindow.getFocusedWindow()
      const options = {
        title: 'Select Tome Directory',
        properties: ['openDirectory']
      }

      const result = await remote.dialog.showOpenDialog(window, options)

      if (result.canceled) {
        return
      }

      if (!result.filePaths.length) {
        this.$emit('close')
        return
      }
    },
    disabled_unless: function (unless) {
      if (unless) {
        return this.disabled
      }

      return this.disabled || this.branch || this.commit || this.push
    }
  },

  computed: {
    tome: function () {
      return store.state.tome
    },
    status: function () {
      return store.state.files.tree ? store.state.files.tree.daemon.status : ''
    }
  },

  components: {
    StatusButton,
    LibraryButton

  }
}
</script>
