<template>
  <utility-page
    right
    title="Push"
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
            size="small"
            storable
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
import { Component, Vue, Setup, toNative } from 'vue-facing-decorator'
import { VContainer, VDivider, VBtn, VIcon, VCard, VCardTitle, VCol, VRow } from 'vuetify/components'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'
import UtilityPage from '@/components/UtilityPage.vue'
import KeyfileInput from './KeyfileInput.vue'
import PushPassphraseInput from './PushPassphraseInput.vue'
import PushRemoteSelector from './PushRemoteSelector.vue'
import PushBranch from './PushBranch.vue'
import PushStatus from './PushStatus.vue'
import PushConfirm from './PushConfirm.vue'

@Component({
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
})
class Push extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  remote_loading = false

  get system () {
    return this.store.state.system
  }

  get open () {
    return this.system.push
  }

  get repository () {
    return this.store.state.repository
  }

  get configuration () {
    return this.store.state.configuration
  }

  async close () {
    await this.store.dispatch('system/push', false)
  }

  async credential_key (value) {
    await this.store.dispatch('repository/credentials/key', value)
  }

  async credential_passphrase (value) {
    await this.store.dispatch('repository/credentials/passphrase', value)
  }

  async confirm (value) {
    await this.store.dispatch('system/push_confirm', value)
  }

  async add_remote (name, url) {
    await this.store.dispatch('repository/create-remote', { name, url })
  }

  async select_remote (name) {
    this.remote_loading = true
    await this.store.dispatch('repository/remote', name)
    this.remote_loading = false
  }

  async diff (commit) {
    await this.store.dispatch('repository/diff', { commit: commit.oid })
    await this.store.dispatch('system/patch', true)
  }

  async push () {
    await this.store.dispatch('system/perform', 'push')
  }
}

export default toNative(Push)
</script>
