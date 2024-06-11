<template>
  <v-card
    class="d-flex flex-column"
    style="height: 100%"
  >
    <template v-if="active">
      <template v-if="loading">
        <v-list-item ref="loading-view">
          <template #prepend>
            <v-avatar color="grey">
              <v-icon>mdi-upload-multiple</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-h5">
            &mdash;
          </v-list-item-title>
          <v-list-item-subtitle>Loading ... </v-list-item-subtitle>
        </v-list-item>
        <v-divider />
        <v-card-text class="text-center">
          &mdash;
        </v-card-text>
      </template>

      <template v-else-if="error">
        <v-list-item ref="error-view">
          <template #prepend>
            <v-avatar color="warning">
              <v-icon>mdi-alert</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-h5">
            Error
          </v-list-item-title>
          <v-list-item-subtitle>{{ error }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider />
        <v-card-text class="text-center">
          <v-btn @click.stop="reselect">
            <v-icon class="mr-2">
              mdi-reload
            </v-icon>
            Retry
          </v-btn>
        </v-card-text>
      </template>

      <template v-else-if="match">
        <v-list-item ref="match-view">
          <template #prepend>
            <v-avatar color="info">
              <v-icon>mdi-thumb-up</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-h5">
            Match
          </v-list-item-title>
          <v-list-item-subtitle>The local repository history matches the remote repository</v-list-item-subtitle>
        </v-list-item>
        <v-divider />
        <v-card-text class="text-center">
          &mdash;
        </v-card-text>
      </template>

      <template v-else>
        <v-list-item ref="compare-view">
          <template #prepend>
            <v-avatar color="success">
              <v-icon>mdi-check</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-h5">
            Compare
          </v-list-item-title>
          <v-list-item-subtitle>View commits that have not yet been pushed in the list below</v-list-item-subtitle>
        </v-list-item>
        <div class="commit-box">
          <div class="commit-list">
            <div
              v-for="item in pending"
              :key="item.oid"
              class="commit-list-row"
            >
              <div class="column-oid">
                <v-btn
                  rounded="0"
                  variant="text"
                  color="success"
                  style="width: 100%;"
                  @click.stop="inspect(item.oid)"
                >
                  {{ item.oid.substring(0, 7) }}
                </v-btn>
              </div>
              <div class="column-message px-2">
                <div class="column-message-text">
                  {{ item.message }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <template v-else>
      <v-list-item ref="blank-view">
        <template #prepend>
          <v-avatar color="grey">
            <v-icon>mdi-cursor-pointer</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title class="text-h5">
          Select Remote
        </v-list-item-title>
        <v-list-item-subtitle>Choose a remote to compare to the local repository</v-list-item-subtitle>
      </v-list-item>
      <v-divider />
      <v-card-text class="text-center">
        &mdash;
      </v-card-text>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'
import {
  VAvatar,
  VBtn,
  VCard,
  VCardText,
  VDivider,
  VIcon,
  VListItem,
  VListItemSubtitle,
  VListItemTitle,
} from 'vuetify/components'

const system = fetch_system_store()
const repository_comparator = fetch_repository_comparator_store()
const repository_remotes = fetch_repository_remotes_store()

const active = computed(() => repository_remotes.process.select || repository_remotes.selected !== '')
const loading = computed(() => repository_remotes.process.select)
const error = computed(() => repository_remotes.error)
const match = computed(() => repository_remotes.active.pending && repository_remotes.active.pending.length <= 0)
const pending = computed(() => repository_remotes.active.pending)

async function reselect () {
  await repository_remotes.reselect()
}

async function inspect (oid) {
  await repository_comparator.diff({ commit: oid })
  await system.page({ patch: true })
}

defineExpose({
  active,
  loading,
  error,
  match,
  pending,
  reselect,
  inspect,
})
</script>

<style scoped>
.commit-box {
  height: 180px;
  flex-grow: 1;
  overflow-y: scroll;
}

.commit-list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0px;
  overflow: hidden;
}

.commit-list-row {
  display: contents;
}

.commit-list-cell {
  display: grid;
  grid-column: span 1;
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
}

.column-oid {
  overflow: hidden;
}

.column-message {
  display: flex;
  align-content: center;
  flex-wrap: wrap;
  overflow: hidden;
}

.column-message-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
