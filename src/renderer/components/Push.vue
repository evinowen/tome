<template>
  <v-navigation-drawer
    :value="system.push"
    fixed
    right
    stateless
    width="100%"
    style="z-index: 100; max-width: 900px; height: auto; top: 25px; bottom: 18px"
    @input="$event || close"
  >
    <v-container
      fluid
      class="pb-0"
      style="height: 100%;"
    >
      <div
        class="d-flex flex-column align-stretch flex-grow-0"
        style="height: 100%;"
      >
        <div class="flex-grow-0">
          <div>
            <v-btn
              tile
              icon
              class="float-right"
              color="black"
              @click.stop="close"
            >
              <v-icon>mdi-window-close</v-icon>
            </v-btn>
            <h1>Push</h1>
          </div>
          <div style="clear: both" />

          <v-card
            dense
            class="my-2"
          >
            <v-card-title class="pa-2">
              Credentials
            </v-card-title>
            <keyfile-input
              small
              storable
              :value="repository.credentials.key"
              :stored="configuration.private_key"
              @input="credential_key"
            />
            <push-passphrase-input
              small
              storable
              :value="repository.credentials.passphrase"
              :stored="configuration.passphrase"
              @input="credential_passphrase"
            />
          </v-card>

          <push-remote-selector
            :value="repository.remote ? repository.remote.name : null"
            :items="repository.remotes"
            @input="select_remote"
            @change="add_remote"
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
                class="text-center pa-0"
                align-center
              >
                <v-icon
                  align-center
                  x-large
                >
                  mdi-chevron-right
                </v-icon>
              </v-col>

              <v-col>
                <push-branch
                  :loading="false"
                  :disabled="!(repository.remote && repository.remote.branch)"
                  :url="repository.remote && repository.remote.branch ? repository.remote.branch.name : null"
                  :name="repository.remote && repository.remote.branch ? repository.remote.branch.short : null"
                />
              </v-col>
            </v-row>
          </v-container>

          <v-divider class="mt-4 mb-2" />
        </div>

        <div class="flex-grow-1 mb-3">
          <push-status
            :active="repository.remote != null"
            :loading="false"
            error=""
            :match="repository.pending && repository.pending.length <= 0"
            :history="repository.pending"
            @click="diff"
          />
        </div>

        <div
          ref="base"
          class="flex-grow-0 pb-3 actions"
        >
          <v-divider class="mt-0 mb-2" />
          <push-confirm
            :value="system.push_confirm"
            :disabled="!(configuration.key && repository.pending && repository.pending.length > 0)"
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
        </div>
      </div>
    </v-container>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue'
import { VNavigationDrawer, VContainer, VDivider, VBtn, VIcon, VCard, VCardTitle, VCol, VRow } from 'vuetify/lib'
import store from '@/store'
import KeyfileInput from './KeyfileInput.vue'
import PushPassphraseInput from './PushPassphraseInput.vue'
import PushRemoteSelector from './PushRemoteSelector.vue'
import PushBranch from './PushBranch.vue'
import PushStatus from './PushStatus.vue'
import PushConfirm from './PushConfirm.vue'

export default Vue.extend({
  components: {
    VNavigationDrawer,
    VContainer,
    VDivider,
    VBtn,
    VIcon,
    VCard,
    VCardTitle,
    VCol,
    VRow,
    KeyfileInput,
    PushPassphraseInput,
    PushRemoteSelector,
    PushBranch,
    PushStatus,
    PushConfirm
  },
  computed: {
    system: function () {
      return store.state.system
    },
    repository: function () {
      return store.state.repository
    },
    configuration: function () {
      return store.state.configuration
    }
  },
  methods: {
    close: async function () {
      await store.dispatch('system/push', false)
    },
    credential_key: async function (value) {
      await store.dispatch('repository/credentials/key', value)
    },
    credential_passphrase: async function (value) {
      await store.dispatch('repository/credentials/passphrase', value)
    },
    confirm: async function (value) {
      await store.dispatch('system/push_confirm', value)
    },
    add_remote: async function (name, url) {
      await store.dispatch('repository/create-remote', { name, url })
    },
    select_remote: async function (name) {
      await store.dispatch('repository/remote', name)
    },
    diff: async function (commit) {
      await store.dispatch('repository/diff', { commit: commit.oid })
      await store.dispatch('system/patch', true)
    },
    push: async function () {
      await store.dispatch('system/perform', 'push')
    }
  }
})
</script>

<style scoped>
.actions {
  backdrop-filter: blur(2px);
  position: sticky;
  bottom: 0px
}
</style>
