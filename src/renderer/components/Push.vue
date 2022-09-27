<template>
  <v-navigation-drawer :value=system.push @input="$event || close" fixed right stateless width="100%" style="z-index: 100; max-width: 900px; height: auto; top: 25px; bottom: 18px">
    <v-container fluid class="pb-0" style="height: 100%;">
      <div class="d-flex flex-column align-stretch flex-grow-0" style="height: 100%;">
        <div class="flex-grow-0">
          <div>
            <v-btn tile icon class="float-right" color="black" @click.stop=close>
              <v-icon>mdi-window-close</v-icon>
            </v-btn>
            <h1>Push</h1>
          </div>
          <div style="clear: both" ></div>

          <v-card dense class="my-2">
            <v-card-title class="pa-2">
              Credentials
            </v-card-title>
            <keyfile-input small storable
              :value=tome.credentials.key
              @input=credential_key
              :stored=configuration.private_key
            />
            <push-passphrase-input small storable
              :value=tome.credentials.passphrase
              @input=credential_passphrase
              :stored=configuration.passphrase
            />
          </v-card>

          <push-remote-selector
            :value="tome.remote ? tome.remote.name : null"
            :items=tome.remotes
            @input=select_remote
            @change=add_remote
          />

          <v-container fluid>
            <v-row align="center" justify="center">
              <v-col>
                <push-branch :name=tome.branch />
              </v-col>

              <v-col cols=1 class="text-center pa-0" align-center>
                <v-icon align-center x-large>mdi-chevron-right</v-icon>
              </v-col>

              <v-col>
                <push-branch
                  :loading="false"
                  :disabled="!(tome.remote && tome.remote.branch)"
                  :url="tome.remote && tome.remote.branch ? tome.remote.branch.name : null"
                  :name="tome.remote && tome.remote.branch ? tome.remote.branch.short : null"
                />
              </v-col>
            </v-row>
          </v-container>

          <v-divider class="mt-4 mb-2"></v-divider>
        </div>

        <div class="flex-grow-1 mb-3">
          <push-status
            :active="tome.remote != null"
            :loading="false"
            error=""
            :match="pending && pending.length <= 0"
            :history=pending
            @click=diff
          />
        </div>

        <div ref="base" class="flex-grow-0 pb-3 actions">
          <v-divider class="mt-0 mb-2"></v-divider>
          <push-confirm
            :value=system.push_confirm @input=confirm
            :disabled="!(configuration.key && pending && pending.length)"
            :waiting=tome.push_working
            :history=tome.pending
            @push=push
          />
          <v-btn color="warning" @click.stop=close>
            <v-icon class="mr-2">mdi-cancel</v-icon>
            Cancel
          </v-btn>
        </div>
      </div>
    </v-container>
  </v-navigation-drawer>
</template>

<style scoped>
.actions {
  backdrop-filter: blur(2px);
  position: sticky;
  bottom: 0px
}
</style>

<script>
import { VNavigationDrawer, VContainer, VDivider, VBtn, VIcon, VCard, VCardTitle, VCol, VRow } from 'vuetify/lib'
import store from '@/store'
import KeyfileInput from './KeyfileInput.vue'
import PushPassphraseInput from './PushPassphraseInput.vue'
import PushRemoteSelector from './PushRemoteSelector.vue'
import PushBranch from './PushBranch.vue'
import PushStatus from './PushStatus.vue'
import PushConfirm from './PushConfirm.vue'

export default {
  computed: {
    system: function () {
      return store.state.system
    },
    tome: function () {
      return store.state.tome
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
      await store.dispatch('tome/credentials/key', value)
    },
    credential_passphrase: async function (value) {
      await store.dispatch('tome/credentials/passphrase', value)
    },
    confirm: async function (value) {
      await store.dispatch('system/push_confirm', value)
    },
    add_remote: async function (name, url) {
      await store.dispatch('tome/create-remote', { name, url })
    },
    select_remote: async function (name) {
      await store.dispatch('tome/remote', name)
    },
    diff: async function (commit) {
      await store.dispatch('tome/diff', { commit: commit.oid })
      await store.dispatch('system/patch', true)
    },
    push: async function () {
      await store.dispatch('system/perform', 'push')
    }
  },
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
  }
}
</script>
