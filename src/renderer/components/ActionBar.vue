<template>
  <v-footer
    app
    class="pa-0"
    order="-1"
    height="18"
  >
    <library-button
      :disabled="disabled_unless()"
      @open="open"
      @close="close"
    />

    <divider />

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

      <divider />

      <branch-button
        :branch="repository.branch"
        :error="repository.branch.error"
        :disabled="disabled_unless(system.branch)"
        @click.stop="branch"
      />

      <divider />
    </template>

    <console-button
      :status="status"
      :message="message"
      :disabled="disabled_unless(system.console || system.commit || system.push)"
      @click.stop="console"
    />

    <template v-if="repository.path">
      <divider />

      <edit-switch
        action-bar-edit
        :value="edit"
        :disabled="disabled_unless()"
        @click.stop="edit"
      />

      <divider />

      <v-expand-x-transition>
        <div
          v-show="system.edit"
          style="white-space: nowrap; height: 100%"
        >
          <!-- SAVE BUTTON -->
          <page-button
            :disabled="disabled_unless(system.commit)"
            @click.stop="commit"
          >
            mdi-content-save
          </page-button>

          <!-- PUSH BUTTON -->
          <page-button
            :disabled="disabled_unless(system.push)"
            @click.stop="push"
          >
            mdi-upload-multiple
          </page-button>
        </div>
      </v-expand-x-transition>

      <divider />

      <!-- SEARCH BUTTON -->
      <div style="height: 100%">
        <page-button
          :disabled="disabled_unless()"
          @click.stop="search"
        >
          mdi-magnify
        </page-button>
      </div>
    </template>
  </v-footer>
</template>

<script lang="ts">
import { Component, Vue, Setup, toNative } from 'vue-facing-decorator'
import { VFooter, VExpandXTransition, VSwitch } from 'vuetify/components'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'
import Divider from './ActionBar/Divider.vue'
import LibraryButton from './ActionBar/LibraryButton.vue'
import BranchButton from './ActionBar/BranchButton.vue'
import ConsoleButton from './ActionBar/ConsoleButton.vue'
import EditSwitch from './ActionBar/EditSwitch.vue'
import PageButton from './ActionBar/PageButton.vue'
import RepositoryButton from './ActionBar/RepositoryButton.vue'

@Component({
  components: {
    VFooter,
    VExpandXTransition,
    VSwitch,
    Divider,
    LibraryButton,
    BranchButton,
    ConsoleButton,
    EditSwitch,
    PageButton,
    RepositoryButton
  }
})
class ActionBar extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  library: false

  get system () {
    return this.store.state.system
  }

  get repository () {
    return this.store.state.repository
  }

  get status () {
    return this.store.state.status
  }

  get message () {
    return this.store.state.message
  }

  get disabled () {
    const system = this.store.state.system
    return system.settings || system.branch || system.commit || system.push || system.console
  }

  async open (path) {
    this.library = false
    await this.store.dispatch('system/open', path)
  }

  async close () {
    await this.store.dispatch('system/close')
  }

  async edit () {
    await this.store.dispatch('system/edit', !this.system.edit)
  }

  async branch () {
    await this.store.dispatch('system/branch', !this.system.branch)
  }

  async commit () {
    await this.store.dispatch('system/commit', !this.system.commit)
  }

  async push () {
    await this.store.dispatch('system/push', !this.system.push)
  }

  async console () {
    await this.store.dispatch('system/console', !this.system.console)
  }

  async search () {
    await this.store.dispatch('system/search', !this.system.search)
  }

  disabled_unless (unless?) {
    if (unless) {
      return this.system.settings
    }

    return this.disabled
  }
}

export default toNative(ActionBar)
</script>
