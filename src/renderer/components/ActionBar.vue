<template>
  <v-footer
    app
    class="pa-0"
    style="z-index: 1000;"
    height="18"
  >
    <library-button
      :disabled="disabled_unless()"
      @open="open"
      @close="close"
    />

    <v-divider
      inset
      vertical
    />

    <template v-if="repository.path">
      <repository-button
        :name="repository.name"
        :path="repository.path"
        :readme="repository.metadata.readme"
        :authors="repository.metadata.authors"
        :contributors="repository.metadata.contributors"
        :license="repository.metadata.license"
        :disabled="disabled_unless()"
      />

      <v-divider
        inset
        vertical
      />

      <v-btn
        v-if="repository.branch"
        tile
        small
        class="button px-2"
        color="primary"
        :disabled="disabled_unless(system.branch)"
        @click.stop="branch"
      >
        {{ repository.branch }}
      </v-btn>
      <v-btn
        v-else-if="repository.branch.error"
        tile
        small
        icon
        class="button pl-1 pr-2"
        color="error"
      >
        <v-icon
          small
          class="pr-1"
        >
          mdi-alert-box
        </v-icon>
        {{ repository.branch.error }}
      </v-btn>

      <v-divider
        inset
        vertical
      />
    </template>

    <v-btn
      tile
      icon
      small
      class="console button"
      :disabled="disabled_unless(system.console || system.commit || system.push)"
      :color="status === 'error' ? 'error' : ''"
      @click.stop="console"
    >
      <v-icon small>
        {{ status === 'error' ? 'mdi-exclamation-thick' : 'mdi-chevron-right' }}
      </v-icon>&nbsp;{{ message }}
    </v-btn>

    <template v-if="repository.path">
      <v-divider
        inset
        vertical
      />

      <v-switch
        action-bar-edit
        :value="edit"
        dense
        x-small
        inset
        hide-details
        class="edit_switch"
        :disabled="disabled_unless()"
        @click.stop="edit"
      />

      <v-divider
        inset
        vertical
      />

      <v-expand-x-transition>
        <div
          v-show="system.edit"
          style="overflow: hidden; white-space: nowrap;"
        >
          <div style="height: 18px">
            <!-- SAVE BUTTON -->
            <v-btn
              action-bar-commit
              tile
              small
              icon
              color="primary"
              class="button pa-0"
              :disabled="disabled_unless(system.commit)"
              @click.stop="commit"
            >
              <v-icon small>
                mdi-content-save
              </v-icon>
            </v-btn>

            <!-- PUSH BUTTON -->
            <v-btn
              action-bar-push
              tile
              small
              icon
              color="primary"
              class="button pa-0"
              :disabled="disabled_unless(system.push)"
              @click.stop="push"
            >
              <v-icon small>
                mdi-upload-multiple
              </v-icon>
            </v-btn>
          </div>
        </div>
      </v-expand-x-transition>

      <v-divider
        inset
        vertical
      />

      <!-- SEARCH BUTTON -->
      <v-btn
        action-bar-search
        tile
        small
        icon
        color="primary"
        class="button pa-0"
        :disabled="disabled_unless()"
        @click.stop="search"
      >
        <v-icon small>
          mdi-magnify
        </v-icon>
      </v-btn>
    </template>
  </v-footer>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { VIcon, VBtn, VDivider, VFooter, VExpandXTransition, VSwitch } from 'vuetify/lib'
import store from '@/store'
import LibraryButton from './LibraryButton.vue'
import RepositoryButton from './RepositoryButton.vue'

export const ActionBarProperties = Vue.extend({})

@Component({
  components: {
    VIcon,
    VBtn,
    VDivider,
    VFooter,
    VExpandXTransition,
    VSwitch,
    LibraryButton,
    RepositoryButton
  }
})
export default class ActionBar extends ActionBarProperties {
  library: false

  get system () {
    return store.state.system
  }

  get repository () {
    return store.state.repository
  }

  get status () {
    return store.state.status
  }

  get message () {
    return store.state.message
  }

  get disabled () {
    const system = store.state.system
    return system.settings || system.branch || system.commit || system.push || system.console
  }

  async open (path) {
    this.library = false
    await store.dispatch('system/open', path)
  }

  async close () {
    await store.dispatch('system/close')
  }

  async edit () {
    await store.dispatch('system/edit', !this.system.edit)
  }

  async branch () {
    await store.dispatch('system/branch', !this.system.branch)
  }

  async commit () {
    await store.dispatch('system/commit', !this.system.commit)
  }

  async push () {
    await store.dispatch('system/push', !this.system.push)
  }

  async console () {
    await store.dispatch('system/console', !this.system.console)
  }

  async search () {
    await store.dispatch('system/search', !this.system.search)
  }

  disabled_unless (unless?) {
    if (unless) {
      return this.system.settings
    }

    return this.disabled
  }
}
</script>

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

.console.button {
  justify-content: left;
  flex-grow: 1;
  font-size: 0.8em;
  padding: 0 4px 0 0 !important;
}

.console.button span {
  width: 100%;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  padding: 0 4px !important;
}

</style>
