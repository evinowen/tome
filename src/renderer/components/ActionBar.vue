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
        :error="!repository.branch ? 'error' : ''"
        :disabled="disabled_unless(system.branch)"
        @click.stop="branch"
      />

      <divider />
    </template>

    <console-button
      :status="status"
      :message="message"
      :disabled="disabled_unless(system.console || system.commit || system.push)"
    />

    <template v-if="repository.path">
      <divider />

      <edit-switch
        action-bar-edit
        :value="system.edit"
        :disabled="disabled_unless()"
        @input="edit"
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
import BranchButton from './ActionBar/BranchButton.vue'
import ConsoleButton from './ActionBar/ConsoleButton.vue'
import Divider from './ActionBar/Divider.vue'
import EditSwitch from './ActionBar/EditSwitch.vue'
import LibraryButton from './ActionBar/LibraryButton.vue'
import PageButton from './ActionBar/PageButton.vue'
import RepositoryButton from './ActionBar/RepositoryButton.vue'
import {
  VExpandXTransition,
  VFooter,
} from 'vuetify/components'

export default {
  components: {
    BranchButton,
    ConsoleButton,
    Divider,
    EditSwitch,
    LibraryButton,
    PageButton,
    RepositoryButton,
    VExpandXTransition,
    VFooter,
  },
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchStore } from '@/store'

const library = ref(false)

const store = fetchStore()

const repository = computed(() => store.state.repository)
const system = computed(() => store.state.system)
const status = computed(() => store.state.status)
const message = computed(() => store.state.message)

function disabled_unless (enabled = false) {
  if (enabled) {
    return system.value.settings
  }

  const flags = [
    system.value.settings,
    system.value.branch,
    system.value.commit,
    system.value.push,
    system.value.console,
  ]

  return flags.includes(true)
}

async function open (path) {
  library.value = false
  await store.dispatch('system/open', path)
}

async function close () {
  await store.dispatch('system/close')
}

async function edit () {
  await store.dispatch('system/edit', !system.value.edit)
}

async function branch () {
  await store.dispatch('system/branch', !system.value.branch)
}

async function commit () {
  await store.dispatch('system/commit', !system.value.commit)
}

async function push () {
  await store.dispatch('system/push', !system.value.push)
}

async function search () {
  await store.dispatch('system/search', !system.value.search)
}

defineExpose({
  library,
  repository,
  system,
  open,
  close,
  edit,
  branch,
  commit,
  push,
  search,
})
</script>
