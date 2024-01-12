<template>
  <utility-page
    right
    title="Push"
    :layer="1"
    :open="system.push"
    @close="close"
  >
    <div style="display: flex; flex-direction: column; height: 100%;">
      <div class="flex-grow-0">
        <v-card
          dense
          class="my-2"
        >
          <v-card-title class="pa-2">
            Credentials
          </v-card-title>
          <keyfile-input
            :value="repository.credentials.key"
            :stored="configuration.private_key"
            @input="credential_key"
          />
          <push-passphrase-input
            size="small"
            storable
            :value="repository.credentials.passphrase"
            :stored="configuration.passphrase"
            @input="credential_passphrase"
          />
        </v-card>

        <push-remote-selector
          :value="repository.remote.name !== '' ? repository.remote.name : undefined"
          :items="repository.remotes"
          @input="select_remote"
          @create="add_remote"
        />

        <v-container fluid>
          <v-row
            align="center"
            justify="center"
          >
            <v-col>
              <push-branch :name="repository.branch"/>
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
                :disabled="repository.remote.branch.name === ''"
                :url="repository.remote.branch.name === '' ? undefined : repository.remote.branch.name"
                :name="repository.remote.branch.name === '' ? undefined : repository.remote.branch.short"
              />
            </v-col>
          </v-row>
        </v-container>

        <v-divider class="mt-4 mb-2" />
      </div>

      <div class="flex-grow-1 mb-3">
        <push-status
          :active="remote_loading || repository.remote.name !== ''"
          :loading="remote_loading"
          error=""
          :match="repository.pending && repository.pending.length <= 0"
          :history="repository.pending"
          @commit="diff"
        />
      </div>
    </div>

    <template #actions>
      <push-confirm
        :value="system.push_confirm"
        :disabled="repository.pending.length === 0"
        :waiting="repository.push_working"
        :history="repository.pending"
        @input="confirm"
        @push="push"
      />
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
</template>

<script lang="ts">
import KeyfileInput from './KeyfileInput.vue'
import PushBranch from './PushBranch.vue'
import PushConfirm from './PushConfirm.vue'
import PushPassphraseInput from './PushPassphraseInput.vue'
import PushRemoteSelector from './PushRemoteSelector.vue'
import PushStatus from './PushStatus.vue'
import UtilityPage from '@/components/UtilityPage.vue'
import {
  VBtn,
  VCard,
  VCardTitle,
  VCol,
  VContainer,
  VDivider,
  VIcon,
  VRow,
} from 'vuetify/components'

export default {
  components: {
    KeyfileInput,
    PushBranch,
    PushConfirm,
    PushPassphraseInput,
    PushRemoteSelector,
    PushStatus,
    UtilityPage,
    VBtn,
    VCard,
    VCardTitle,
    VCol,
    VContainer,
    VDivider,
    VIcon,
    VRow,
  }
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

const remote_loading = ref<boolean>(false)

const system = computed(() => store.state.system)
const repository = computed(() => store.state.repository)
const configuration = computed(() => store.state.configuration)

async function close () {
  await store.dispatch('system/push', false)
}

async function credential_key (value) {
  await store.dispatch('repository/credentials/key', value)
}

async function credential_passphrase (value) {
  await store.dispatch('repository/credentials/passphrase', value)
}

async function confirm (value) {
  await store.dispatch('system/push_confirm', value)
}

async function add_remote (name, url) {
  await store.dispatch('repository/create-remote', { name, url })
}

async function select_remote (name) {
  remote_loading.value = true
  await store.dispatch('repository/remote', name)
  remote_loading.value = false
}

async function diff (commit) {
  await store.dispatch('repository/diff', { commit: commit.oid })
  await store.dispatch('system/patch', true)
}

async function push () {
  await store.dispatch('system/perform', 'push')
}

defineExpose({
  add_remote,
  diff,
  push,
  select_remote,
})
</script>
