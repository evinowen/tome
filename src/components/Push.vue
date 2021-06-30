<template>
  <v-navigation-drawer v-model=open @input="$emit('input', $event)" fixed right stateless width="100%" style="z-index: 100; height: auto; top: 25px; bottom: 18px">
    <v-container fluid class="pa-4">
      <v-row no-gutters>
        <v-col>
          <h1>Push</h1>
        </v-col>
        <v-col col=1 class="text-right">
          <v-btn tile icon color="red" @click.stop="$emit('close')">
            <v-icon>mdi-window-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col>
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
        </v-col>
      </v-row>

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

      <v-divider class="mt-4 mb-2"></v-divider>

      <v-row align="center" justify="center">
        <v-col>
          <push-status
            :active="input.remotes.value != null"
            :loading=input.branch.loading
            :error=input.branch.error
            :match="input.branch.history.length <= 0"
            :history=input.branch.history
          />
        </v-col>
      </v-row>

      <v-divider class="mt-4 mb-2"></v-divider>

      <v-row>
        <v-col>
          <v-dialog v-model="confirm" persistent max-width="600px">
            <template v-slot:activator="{ on }">
              <v-btn class="mr-4" v-on="on"
                :disabled="(input.private_key.value && input.public_key.value && input.branch.ahead ) ? false : true"
              >
                <v-icon class="mr-2">mdi-upload-multiple</v-icon>
                Push
              </v-btn>
            </template>
            <v-card>
              <v-list-item>
                <v-list-item-avatar color="orange">
                  <v-icon>mdi-upload-multiple</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title class="headline">Push</v-list-item-title>
                  <v-list-item-subtitle>Push completed commits up to remote repository</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-container class="pa-0 ma-0" style="background: #DDDDDD; min-height: 120px">
                <v-data-table
                  dense disable-sort class="my-0 commit-history"
                  :headers="input.branch.headers"
                  :items="input.branch.history"
                  :hide-default-footer="true"
                  :items-per-page="input.branch.history.length"
                >
                  <template v-slot:item.oid="{ item }">
                    <v-btn tile icon x-small color="orange">
                      {{ item.oid.substring(0, 7) }}
                    </v-btn>
                  </template>
                </v-data-table>
              </v-container>
              <v-card-actions>
                <v-btn
                  ref="push_confirm"
                  color="orange darken-1"
                  text @click="push"
                  :disabled="working"
                >
                  <v-progress-circular
                    :indeterminate="working"
                    :size="12"
                    :width="2"
                    color="orange darken-1"
                    class="mr-2"
                  ></v-progress-circular>
                  Proceed
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="darken-1" text @click="confirm = false" :disabled="working">
                  <v-icon class="mr-2">mdi-exit-to-app</v-icon>
                  Back
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>

        <v-col class="text-right">
          <v-btn color="red" @click.stop="$emit('close')">
            <v-icon class="mr-2">mdi-cancel</v-icon>
            Cancel
          </v-btn>

        </v-col>
      </v-row>

    </v-container>
  </v-navigation-drawer>
</template>

<style>
.passphrase.v-input .v-input__slot {
  min-height: 0px !important;
  border-radius: 0px;
}

.v-data-table.commit-history {
  border-radius: 0
}

.v-data-table.commit-history .v-btn {
  width: 100% !important;
  height: 100% !important;
  text-align: left;
  justify-content: left;
}

.v-data-table.commit-history th {
  height: 1px;
}

.v-data-table.commit-history td {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 8px !important;
}

.v-data-table.commit-history td:first-child {
  padding: 0px !important;
}

.v-data-table.commit-history td:first-child .v-btn {
  text-align: center;
  justify-content: center;
}

.v-data-table.commit-history .v-btn .v-icon {
  font-size: 14px !important;
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
    PushStatus
  }
}
</script>
