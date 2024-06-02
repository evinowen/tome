<template>
  <div>
    <utility-page
      right
      title="Push"
      :layer="1"
      :open="system.push"
      @close="close"
    >
      <div style="display: flex; flex-direction: column; flex-grow: 1; height: 100%;">
        <div class="flex-grow-0">
          <v-card
            class="mb-3"
            color="surface"
            title="Push Credentials"
            subtitle="Set credentials that will be used to push your commits to the selected remote repository"
          >
            <credential-selector />
          </v-card>

          <v-card
            class="mb-3"
            color="surface"
            title="Push Remote"
            subtitle="Select which remote repository to target for this push"
          >
            <template #append>
              <v-btn @click="remotes">
                <v-icon class="mr-2">
                  mdi-web
                </v-icon>
                Remotes
              </v-btn>
            </template>
            <push-remote-selector
              :value="repository_remotes.active.name !== '' ? repository_remotes.active.name : undefined"
              :items="repository_remotes.list"
              @update="select_remote"
            />
          </v-card>

          <v-container fluid>
            <v-row
              align="center"
              justify="center"
            >
              <v-col>
                <push-branch :name="repository_branches.active" />
              </v-col>

              <v-col
                cols="1"
                class="text-center pa-0 align-center"
              >
                <v-icon
                  align-center
                  size="x-large"
                >
                  mdi-chevron-right
                </v-icon>
              </v-col>

              <v-col>
                <push-branch
                  :loading="remote_loading"
                  :disabled="repository_remotes.active.branch?.name === ''"
                  :url="repository_remotes.active.branch?.name === '' ? undefined : repository_remotes.active.branch?.name"
                  :name="repository_remotes.active.branch?.name === '' ? undefined : repository_remotes.active.branch?.short"
                />
              </v-col>
            </v-row>
          </v-container>
        </div>

        <push-status
          class="flex-grow-1 mb-3"
          :active="remote_loading || repository_remotes.active.name !== ''"
          :loading="remote_loading"
          error=""
          :match="repository_remotes.active.pending && repository_remotes.active.pending.length <= 0"
          :history="repository_remotes.active.pending"
          @commit="diff"
        />
      </div>

      <template #actions>
        <v-btn
          class="mr-4"
          :disabled="repository_remotes.active.pending.length === 0"
          @click.stop="confirm(true)"
        >
          <v-icon class="mr-2">
            mdi-upload-multiple
          </v-icon>
          Push
        </v-btn>
        <v-btn
          color="warning"
          @click.stop="close"
        >
          <v-icon class="mr-2">
            mdi-cancel
          </v-icon>
          Cancel
        </v-btn>
      </template>
    </utility-page>
    <push-confirm
      :visible="system.push_confirm"
      :waiting="repository_remotes.push.working"
      :history="repository_remotes.active.pending"
      @close="confirm(false)"
      @inspect="(item) => { confirm(false); diff(item); }"
      @push="push"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'
import { fetch_repository_branches_store } from '@/store/modules/repository/branches'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'
import PushBranch from './PushBranch.vue'
import PushConfirm from './PushConfirm.vue'
import PushRemoteSelector from './PushRemoteSelector.vue'
import PushStatus from './PushStatus.vue'
import UtilityPage from '@/components/UtilityPage.vue'
import CredentialSelector from '@/components/Settings/Credentials/CredentialSelector.vue'
import {
  VBtn,
  VCard,
  VCol,
  VContainer,
  VIcon,
  VRow,
} from 'vuetify/components'

const system = fetch_system_store()
const repository_remotes = fetch_repository_remotes_store()
const repository_branches = fetch_repository_branches_store()
const repository_comparator = fetch_repository_comparator_store()

const remote_loading = ref<boolean>(false)

async function close () {
  await system.page({ push: false })
}

async function confirm (value) {
  await system.page({ push_confirm: value })
}

async function select_remote (name) {
  remote_loading.value = true
  await repository_remotes.select(name)
  remote_loading.value = false
}

async function diff (commit) {
  await repository_comparator.diff({ commit: commit.oid })
  await system.page({ patch: true })
}

async function push () {
  await system.perform(SystemPerformance.Push)
}

async function remotes () {
  await system.page({ remotes: true })
}

defineExpose({
  close,
  confirm,
  diff,
  push,
  remotes,
  select_remote,
})
</script>
