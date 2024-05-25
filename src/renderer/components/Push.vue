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
              :value="repository.remote.name !== '' ? repository.remote.name : undefined"
              :items="repository.remotes.list"
              @update="select_remote"
            />
          </v-card>

          <v-container fluid>
            <v-row
              align="center"
              justify="center"
            >
              <v-col>
                <push-branch :name="repository.branch" />
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
                  :disabled="repository.remote.branch?.name === ''"
                  :url="repository.remote.branch?.name === '' ? undefined : repository.remote.branch?.name"
                  :name="repository.remote.branch?.name === '' ? undefined : repository.remote.branch?.short"
                />
              </v-col>
            </v-row>
          </v-container>
        </div>

        <push-status
          class="flex-grow-1 mb-3"
          :active="remote_loading || repository.remote.name !== ''"
          :loading="remote_loading"
          error=""
          :match="repository.pending && repository.pending.length <= 0"
          :history="repository.pending"
          @commit="diff"
        />
      </div>

      <template #actions>
        <v-btn
          class="mr-4"
          :disabled="repository.pending.length === 0"
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
      :waiting="repository.push_working"
      :history="repository.pending"
      @close="confirm(false)"
      @inspect="(item) => { confirm(false); diff(item); }"
      @push="push"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchStore } from '@/store'
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

const store = fetchStore()

const remote_loading = ref<boolean>(false)

const system = computed(() => store.state.system)
const repository = computed(() => store.state.repository)

async function close () {
  await store.dispatch('system/push', false)
}

async function confirm (value) {
  await store.dispatch('system/push_confirm', value)
}

async function select_remote (name) {
  remote_loading.value = true
  await store.dispatch('repository/remote', name)
  remote_loading.value = false
}

async function diff (commit) {
  await store.dispatch('repository/comparator/diff', { commit: commit.oid })
  await store.dispatch('system/patch', true)
}

async function push () {
  await store.dispatch('system/perform', 'push')
}

async function remotes () {
  await store.dispatch('system/remotes', true)
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
