<template>
  <overlay-box
    :visible="system.push_confirm"
    :secure="false"
    @click="close"
  >
    <v-card style="max-width: calc(100vw - 50px); max-height: calc(100vh - 50px)">
      <v-list-item class="my-2">
        <template #prepend>
          <v-avatar color="warning">
            <v-icon>mdi-upload-multiple</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title class="text-h5">
          Push
        </v-list-item-title>
        <v-list-item-subtitle>Push completed commits up to remote repository</v-list-item-subtitle>
      </v-list-item>
      <div class="text-h5 text-center pb-2">
        <strong>{{ pending.length }}</strong> commit{{ pending.length === 1 ? '' : 's' }} to be pushed
      </div>
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
              color="warning"
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
      <v-card-actions class="confirm-actions">
        <v-btn
          ref="push-button"
          color="warning"
          variant="text"
          :disabled="waiting || pending.length === 0"
          @click="push"
        >
          <v-progress-circular
            :indeterminate="waiting"
            :size="12"
            :width="2"
            color="warning"
            class="mr-2"
          />
          Proceed
        </v-btn>
        <v-spacer />
        <v-btn
          ref="return-button"
          color="darken-1"
          variant="text"
          :disabled="waiting"
          @click="close"
        >
          <v-icon class="mr-2">
            mdi-exit-to-app
          </v-icon>
          Back
        </v-btn>
      </v-card-actions>
    </v-card>
  </overlay-box>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'
import OverlayBox from '@/components/OverlayBox.vue'
import {
  VAvatar,
  VBtn,
  VCard,
  VCardActions,
  VIcon,
  VListItem,
  VListItemSubtitle,
  VListItemTitle,
  VProgressCircular,
  VSpacer,
} from 'vuetify/components'

const system = fetch_system_store()
const repository_remotes = fetch_repository_remotes_store()
const repository_comparator = fetch_repository_comparator_store()

const pending = computed(() => repository_remotes.active.pending)
const waiting = computed(() => repository_remotes.process.push)

async function inspect (oid) {
  close()

  await repository_comparator.diff({ commit: oid })
  await system.page({ patch: true })
}

async function push () {
  await system.perform(SystemPerformance.Push)
}

async function close () {
  await system.page({ push_confirm: false })
}

defineExpose({
  inspect,
  push,
  close,
})
</script>

<style scoped>
.commit-list {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0px;
  max-height: 50vh;
  overflow: hidden;
  overflow-y: scroll;
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

.confirm-actions {
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  bottom: 0;
  position: sticky;
}
</style>
