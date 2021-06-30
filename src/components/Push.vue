<template>
  <v-navigation-drawer v-model=open @input="$emit('input', $event)" fixed right stateless width="100%" style="z-index: 100; height: auto; top: 25px; bottom: 18px">
    <v-container fluid class="pa-4" style="height: 100%;">
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

            <push-keyfile-input v-model=input.private_key.value :stored=configuration.private_key />
            <push-keyfile-input v-model=input.public_key.value :stored=configuration.public_key />
            <push-passphrase-input v-model=input.passphrase.value :stored=configuration.passphrase />
          </v-card>

          <push-remote-selector
            v-model=input.remotes.value
            :items=input.remotes.list
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
                  :url="input.branch.reference ? input.branch.reference.name : null"
                  :name="input.branch.reference ? input.branch.reference.short : null"
                />
              </v-col>
            </v-row>
          </v-container>

          <v-divider class="mt-4 mb-2"></v-divider>
        </div>

        <div class="flex-grow-1">
          <push-status
            :active="input.remotes.value != null"
            :loading=input.branch.loading
            :error=input.branch.error
            :match="input.branch.history.length <= 0"
            :history=input.branch.history
          />
        </div>

        <div class="flex-grow-0" style="margin-top: auto">
          <v-divider class="mt-4 mb-2"></v-divider>
          <v-container fluid>
            <v-row>
              <v-col>
                <push-confirm
                  v-model=confirm
                  :disabled="!(input.private_key.value && input.public_key.value && input.branch.ahead )"
                  :waiting=working
                  :history=input.branch.history
                  @push=push
                />
              </v-col>

              <v-col class="text-right">
                <v-btn color="red" @click.stop="$emit('close')">
                  <v-icon class="mr-2">mdi-cancel</v-icon>
                  Cancel
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </div>
      </div>
    </v-container>
  </v-navigation-drawer>
</template>

<style>
.passphrase.v-input .v-input__slot {
  min-height: 0px !important;
  border-radius: 0px;
}
</style>

<script>
import store from '@/store'
import NodeGit from 'nodegit'
import PushKeyfileInput from './PushKeyfileInput.vue'
import PushPassphraseInput from './PushPassphraseInput.vue'
import PushRemoteSelector from './PushRemoteSelector.vue'
import PushBranch from './PushBranch.vue'
import PushStatus from './PushStatus.vue'
import PushConfirm from './PushConfirm.vue'

export default {
  props: {
    value: { type: Boolean, default: false }
  },
  data: () => ({
    open: false,
    confirm: false,
    working: false,
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
        value: '',
        obscured: false
      },
      public_key: {
        value: '',
        obscured: false
      },
      passphrase: {
        value: '',
        obscured: false
      },
      branch: {
        error: null,
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
  watch: {
    value: function (value) { this.open = value }
  },
  computed: {
    repository: function () {
      return store.state.tome.repository
    },
    branch: function () {
      return store.state.tome.branch.name
    },
    configuration: function () {
      return store.state.configuration
    }
  },
  mounted: async function () {
    if (this.configuration.private_key) {
      this.input.private_key.value = this.configuration.private_key
    }

    if (this.configuration.public_key) {
      this.input.public_key.value = this.configuration.public_key
    }

    if (this.configuration.passphrase) {
      this.input.passphrase.value = this.configuration.passphrase
    }

    await this.load_remotes()
  },
  methods: {
    credentials: function () {
      return {
        private_key: this.input.private_key.value,
        public_key: this.input.public_key.value,
        passphrase: this.input.passphrase.value
      }
    },

    callbacks: function () {
      const credentials = this.credentials()

      return {
        credentials: function (url, username) {
          return NodeGit.Cred.sshKeyNew(username, credentials.public_key, credentials.private_key, credentials.passphrase)
        },

        certificateCheck: () => 0

      }
    },

    load_remotes: async function () {
      const items = await this.repository.getRemotes()

      this.input.remotes.list = items.map(remote => ({
        name: remote.name(),
        url: remote.url(),
        object: remote
      }))
    },
    add_remote: async function (name, url) {
      await NodeGit.Remote.create(this.repository, name, url)

      await this.load_remotes()
    },
    select_remote: async function (remote) {
      this.input.remotes.value = remote

      this.input.branch.reference = null
      this.input.branch.loading = true
      this.input.branch.loaded = false
      this.input.branch.ahead = false

      await this.load_branch()

      this.input.branch.loading = false
    },
    load_branch: async function () {
      const remote = this.input.remotes.value
      this.input.branch.error = 'Loading ... '
      this.input.branch.history = []

      try {
        await remote.object.connect(NodeGit.Enums.DIRECTION.FETCH, this.callbacks())

        const references = await remote.object.referenceList()
        references.map(async reference => {
          const object = {
            name: reference.name(),
            object: reference

          }

          const parsed = reference.name().match(/^refs\/heads\/(.*)$/m)

          if (parsed) {
            object.short = parsed[1]

            if (object.short === this.branch) {
              this.input.branch.reference = object
            }
          }

          return object
        })

        let local_commit = await this.repository.getReferenceCommit(this.branch)
        const remote_commit = await this.repository.getCommit(this.input.branch.reference.object.oid())

        let ahead = 0

        do {
          if (remote_commit.id().cmp(local_commit.id()) === 0) {
            break
          }

          this.input.branch.history.push({
            oid: local_commit.id().tostrS(),
            message: local_commit.message()
          })
          ahead++

          if (local_commit.parentcount() < 1) {
            throw new Error('Detached')
          }

          local_commit = await local_commit.parent(0)
        } while (local_commit)

        if (ahead > 0) {
          this.input.branch.ahead = true
        }

        this.input.branch.loaded = true
      } catch (error) {
        this.input.branch.error = error
        return
      }

      this.input.branch.error = null
    },

    push: async function (event) {
      this.working = true

      if (!this.input.remotes.value) {
        this.confirm = false
        this.working = false

        return false
      }

      (await this.repository.getReferences()).map(reference => ({
        name: reference.name(),
        object: reference
      }))

      const refspec = `refs/heads/${this.branch}:refs/heads/${this.branch}`

      await this.input.remotes.value.object.push([refspec], { callbacks: this.callbacks() })

      this.confirm = false
      this.working = false

      this.$emit('close')

      return true
    }
  },
  components: {
    PushKeyfileInput,
    PushPassphraseInput,
    PushRemoteSelector,
    PushBranch,
    PushStatus,
    PushConfirm
  }
}
</script>
