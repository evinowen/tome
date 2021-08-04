<template>
  <v-footer
    app
    class="pa-0"
    style="position: absolute; z-index: 1000;"
    height=18
  >
    <library-button v-model=library @open=open @close="$emit('close')" :disabled="disabled_unless()" />

    <v-divider inset vertical />

    <template v-if="tome.path">
      <repository-button
        :name=tome.name
        :path=tome.path
        :readme=tome.metadata.readme
        :authors=tome.metadata.authors
        :contributors=tome.metadata.contributors
        :license=tome.metadata.license
        :disabled="disabled_unless()"
        @open=open_file
      />

      <v-divider inset vertical />

      <v-btn v-if="tome.branch" tile small class="button px-2" color="primary" @click.stop="$emit('branch')" :disabled="disabled_unless(branch)">
        {{ tome.branch }}
      </v-btn>
      <v-btn v-else-if="tome.branch.error" tile small icon class="button pl-1 pr-2" color="error">
        <v-icon small class="pr-1">mdi-alert-box</v-icon>
        {{ tome.branch.error }}
      </v-btn>

      <v-divider inset vertical />

    </template>

    <v-spacer class="console">
      <v-btn tile icon small class="button" style="width: 100%"
        @click.stop="$emit('console')"
        :disabled="disabled_unless(console)"
        :color="status === 'error' ? 'error' : ''"
      >
        <v-icon small>{{ status === 'error' ? 'mdi-exclamation-thick' : 'mdi-chevron-right' }}</v-icon>&nbsp;{{ message }}
      </v-btn>
    </v-spacer>

    <template v-if="tome.path">
      <v-divider inset vertical />

      <v-switch action-bar-edit :value="edit" @click.stop="$emit('edit')" dense x-small inset hide-details class="edit_switch" :disabled="disabled_unless()"></v-switch>

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
import RepositoryButton from './RepositoryButton.vue'

export default {
  props: {
    menu: { type: Array, default: () => [] },
    waiting: { type: Number, default: 0 },
    waiting_max: { type: Number, default: 3 },
    edit: { type: Boolean, default: false },
    branch: { type: Boolean, default: false },
    commit: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },

  data: () => ({
    library: false
  }),

  methods: {
    open: async function (path) {
      this.library = false

      if (path) {
        this.$emit('open', path)
      } else {
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

        this.$emit('open', result.filePaths[0])
      }
    },
    open_file: function (path) {
      store.dispatch('files/select', { path })
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
    LibraryButton,
    RepositoryButton

  }
}
</script>
