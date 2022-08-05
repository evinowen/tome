<template>
  <v-navigation-drawer :value=value @input="$emit('input', $event)" fixed right stateless width="100%" style="z-index: 100; height: auto; top: 25px; bottom: 18px">
    <v-container fluid class="pb-0" style="height: 100%;">
      <div class="d-flex flex-column align-stretch flex-grow-0" style="height: 100%;">
        <div class="flex-grow-0">
          <div>
            <v-btn tile icon class="float-right" color="black" @click.stop="$emit('close')">
              <v-icon>mdi-window-close</v-icon>
            </v-btn>
            <h1>Push</h1>
          </div>
          <div style="clear: both" ></div>

          <v-card dense class="my-2">
            <v-card-title class="pa-2">
              Credentials
            </v-card-title>

            <keyfile-input v-model=input.private_key.value small storable :stored=configuration.private_key />
            <push-passphrase-input v-model=input.passphrase.value :stored=configuration.passphrase small storable />
          </v-card>

          <push-remote-selector
            v-model=input.remotes.value
            :items=remotes
            @input=select_remote
            @change=add_remote
          />

          <v-container fluid>
            <v-row align="center" justify="center">
              <v-col>
                <push-branch :name=branch />
              </v-col>

              <v-col cols=1 class="text-center pa-0" align-center>
                <v-icon align-center x-large>mdi-chevron-right</v-icon>
              </v-col>

              <v-col>
                <push-branch
                  :loading="input.branch.loading"
                  :disabled="!input.branch.reference"
                  :url="remote && remote.branch ? remote.branch.name : null"
                  :name="remote && remote.branch ? remote.branch.short : null"
                />
              </v-col>
            </v-row>
          </v-container>

          <v-divider class="mt-4 mb-2"></v-divider>
        </div>

        <div class="flex-grow-1 mb-3">
          <push-status
            :active="input.remotes.value != null"
            :loading=input.branch.loading
            :error=input.branch.error
            :match="pending.length <= 0"
            :history=pending
            @click=diff
          />
        </div>

        <div ref="base" class="flex-grow-0 pb-3 actions">
          <v-divider class="mt-0 mb-2"></v-divider>
          <push-confirm
            :value=confirm @input="$emit('confirm', $event)"
            :disabled="!(input.private_key.value && pending.length)"
            :waiting=working
            :history=pending
            @push=push
          />
          <v-btn color="warning" @click.stop="$emit('close')">
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
  props: {
    value: { type: Boolean, default: false },
    confirm: { type: Boolean, default: false }
  },
  data: () => ({
    input: {
      remotes: {
        selected: null,
        value: null,
        list: [],
        edit: false,
        input: {
          name: '',
          url: ''
        }
      },
      private_key: {
        value: ''
      },
      passphrase: {
        value: ''
      },
      branch: {
        error: '',
        loading: false,
        loaded: false,
        ahead: false,
        history: [],
        headers: [
          { text: '', value: 'oid', width: '60px' },
          { text: '', value: 'message', width: '' }
        ]
      }
    }
  }),
  computed: {
    remotes: function () {
      return store.state.tome.remotes
    },
    remote: function () {
      return store.state.tome.remote
    },
    pending: function () {
      return store.state.tome.pending
    },
    branch: function () {
      return store.state.tome.branch
    },
    configuration: function () {
      return store.state.configuration
    },
    working: function () {
      return store.state.tome.push_working
    }
  },
  mounted: async function () {
    if (this.configuration.private_key) {
      this.input.private_key.value = this.configuration.private_key
    }

    if (this.configuration.passphrase) {
      this.input.passphrase.value = this.configuration.passphrase
    }
  },
  methods: {
    add_remote: async function (name, url) {
      await store.dispatch('tome/create-remote', { name, url })
    },
    select_remote: async function (remote) {
      if (!remote) {
        return
      }

      this.input.remotes.value = remote

      this.input.branch.reference = null
      this.input.branch.loading = true
      this.input.branch.loaded = false
      this.input.branch.ahead = false

      const credentials = {
        private_key: this.input.private_key.value,
        passphrase: this.input.passphrase.value
      }

      await store.dispatch('tome/credentials', credentials)
      await store.dispatch('tome/remote', remote.url)

      this.input.branch.loading = false
    },
    diff: async function (commit) {
      await store.dispatch('tome/diff', { commit: commit.oid })

      this.$emit('patch')
    },
    push: async function () {
      await store.dispatch('tome/push')

      this.$emit('confirm', false)

      this.$emit('close')
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
