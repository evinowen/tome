<template>
  <v-footer
    app
    class="pa-0"
    order="-1"
    height="18"
  >
    <library-button :disabled="disabled_unless()" />

    <divider />

    <template v-if="repository.path">
      <repository-button
        :name="repository.name"
        :path="repository.path"
        :readme="repository_metadata.readme"
        :authors="repository_metadata.authors"
        :contributors="repository_metadata.contributors"
        :license="repository_metadata.license"
        :disabled="disabled_unless()"
      />

      <divider />

      <history-button
        :branch="repository_branches.active"
        :error="!repository_branches.active ? 'error' : ''"
        :disabled="disabled_unless(system.history)"
        @click.stop="history"
      />

      <divider />
    </template>

    <console-button
      :status="log.status"
      :message="log.message"
      :disabled="disabled_unless(system.console || system.commit || system.push)"
    />

    <template v-if="repository.path">
      <divider />

      <edit-switch
        action-bar-edit
        :value="system.edit"
        :disabled="disabled_unless()"
        @update="edit"
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
import HistoryButton from './ActionBar/HistoryButton.vue'
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
    HistoryButton,
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
import { ref } from 'vue'
import { fetch_log_store } from '@/store/log'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_repository_store } from '@/store/modules/repository'
import { fetch_repository_branches_store } from '@/store/modules/repository/branches'
import { fetch_repository_metadata_store } from '@/store/modules/repository/metadata'

const library = ref(false)

const log = fetch_log_store()
const system = fetch_system_store()
const repository = fetch_repository_store()
const repository_branches = fetch_repository_branches_store()
const repository_metadata = fetch_repository_metadata_store()

function disabled_unless (enabled = false) {
  if (enabled) {
    return system.settings
  }

  const flags = [
    system.settings,
    system.history,
    system.commit,
    system.push,
    system.console,
  ]

  return flags.includes(true)
}

async function edit () {
  await system.page({ edit: !system.edit })
}

async function history () {
  await system.page({ history: !system.history })
}

async function commit () {
  await system.page({ commit: !system.commit })
}

async function push () {
  await system.page({ push: !system.push })
}

async function search () {
  await system.page({ search: !system.search })
}

defineExpose({
  library,
  repository,
  system,
  edit,
  history,
  commit,
  push,
  search,
})
</script>
