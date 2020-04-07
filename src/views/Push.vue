<template>
  <v-container style="height: 100%; padding: 0px;">
    <v-container class="pa-4" style="height: 100%; overflow: auto;">
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

      <hr />

      <v-row no-gutters>
        <v-col>

          <v-card dense class="my-2">
            <v-card-title class="pa-2">
              Credentials
            </v-card-title>

            <v-row no-gutters>
              <v-col>
                <input ref="private_key" type="file" style="display: none" @change="assign_private_key" />
                <v-btn tile icon small dark :color="input.private_key.value ? 'green' : 'red'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="$refs.private_key.click()">
                  <v-icon small>{{ input.private_key.value ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
                  {{ input.private_key.value }}
                </v-btn>
              </v-col>
              <v-col cols=1>
                <v-btn tile icon small dark :color="configuration.private_key ? 'orange' : 'grey'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="input.private_key.value = configuration.private_key">
                  <v-icon small>mdi-key</v-icon>
                </v-btn>
              </v-col>

            </v-row>

            <v-row no-gutters>
              <v-col>
                <input ref="public_key" type="file" style="display: none" @change="assign_public_key" />
                <v-btn tile icon small dark :color="input.public_key.value ? 'green' : 'red'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="$refs.public_key.click()">
                  <v-icon small>{{ input.public_key.value ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
                  {{ input.public_key.value }}
                </v-btn>
              </v-col>
              <v-col cols=1>
                <v-btn tile icon small dark :color="configuration.public_key ? 'orange' : 'grey'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="input.public_key.value = configuration.public_key">
                  <v-icon small>mdi-key</v-icon>
                </v-btn>
              </v-col>

            </v-row>

            <v-row no-gutters>
              <v-col>
                <v-text-field
                  v-model="input.passphrase.value"
                  :append-icon="input.passphrase.obscured ? 'mdi-eye-off' : 'mdi-eye'"
                  :type="input.passphrase.obscured ? 'password' : 'text'"
                  solo dense filled flat x-small clearable
                  height=28 class="passphrase" style="min-height: 0px;"
                  @click:append="input.passphrase.obscured = !input.passphrase.obscured"
                  hint="passphrase"
                />
              </v-col>
              <v-col cols=1>
                <v-btn tile icon small dark :color="configuration.passphrase ? 'orange' : 'grey'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="input.passphrase.value = configuration.passphrase">
                  <v-icon small>mdi-key</v-icon>
                </v-btn>
              </v-col>

            </v-row>
          </v-card>

          <v-card dense class="my-2">
            <v-card-title class="pa-2">
              Remote
            </v-card-title>
            <v-card-actions>
              <v-select
                :items="input.remotes.list"
                label="Remote"
                @change="select_remote"
                dense clearable class="mt-4"
              >
                <template v-slot:selection="data">
                  {{ data.item.name }}
                  <v-spacer />
                  <small>{{ data.item.url }}</small>
                </template>
                <template v-slot:item="data">
                  {{ data.item.name }}
                  <v-spacer />
                  {{ data.item.url }}
                </template>
                <template v-slot:append-outer>
                  <v-btn icon :color="input.remotes.edit ? 'orange' : 'grey'" @click.stop="input.remotes.edit = !input.remotes.edit">
                    <v-icon>mdi-square-edit-outline</v-icon>
                  </v-btn>
                </template>
              </v-select>
            </v-card-actions>

            <v-expand-transition>
              <div v-show="input.remotes.edit" class="px-6">
                <form>
                  <v-row dense background="red">
                      <v-col cols="12" sm="3">
                        <v-text-field
                          v-model="input.remotes.input.name"
                          label="Name"
                          required dense
                        />
                      </v-col>
                      <v-col cols="12" sm="9">
                        <v-text-field
                          v-model="input.remotes.input.url"
                          label="URL"
                          required dense
                          append-outer-icon="mdi-plus-thick"
                        >
                          <template v-slot:append-outer>
                            <v-btn icon color="green" @click.stop="add_remote">
                              <v-icon>mdi-plus-thick</v-icon>
                            </v-btn>
                          </template>
                        </v-text-field>
                      </v-col>
                  </v-row>
                </form>
              </div>
            </v-expand-transition>
          </v-card>

        </v-col>
      </v-row>

      <v-row align="center" justify="center">
        <v-col>
          <v-card  class="text-center">
            <v-card-text>
              <div class="title text--primary">&mdash;</div>
              <hr/>
              <div class="display-1 text--primary">{{ branch }}</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols=1 class="text-center pa-0" align-center>
          <v-icon align-center x-large>mdi-chevron-right</v-icon>
        </v-col>

        <v-col>
          <v-card class="text-center" :loading="input.branch.loading" :disabled="!input.branch.reference">
            <v-card-text v-if="input.branch.reference">
              <div class="title text--primary">{{ input.branch.reference.name }}</div>
              <hr/>
              <div class="display-1 text--primary">{{ input.branch.reference.short }}</div>
            </v-card-text>
            <v-card-text v-else>
              <div class="title text--primary">&mdash;</div>
              <hr/>
              <div class="display-1 text--primary">&mdash;</div>
            </v-card-text>
          </v-card>
        </v-col>

      </v-row>

      <v-divider class="mt-4 mb-2"></v-divider>

      <v-row align="center" justify="center">
        <v-col>
          <v-card>
            <template v-if=input.remotes.value>
              <template v-if=input.branch.loading>
                <v-list-item>
                  <v-list-item-avatar color="grey">
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="headline">&mdash;</v-list-item-title>
                    <v-list-item-subtitle>Loading ... </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <v-card-text class="text-center">&mdash;</v-card-text>
              </template>
              <template v-else-if=this.input.branch.error>
                <v-list-item>
                  <v-list-item-avatar color="red">
                    <v-icon dark>mdi-alert</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="headline">Error</v-list-item-title>
                    <v-list-item-subtitle>{{ this.input.branch.error }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>
                <v-card-text class="text-center">
                  <v-btn @click.stop="load_branch">
                    <v-icon class="mr-2">mdi-reload</v-icon>
                    Retry
                  </v-btn>
                </v-card-text>
              </template>
              <template v-else>
                <v-list-item>
                  <v-list-item-avatar color="green">
                    <v-icon dark>mdi-check</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="headline">Compare</v-list-item-title>
                    <v-list-item-subtitle>View the commit history difference below</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-divider></v-divider>

                <v-data-table
                  dense disable-sort class="my-0"
                  :headers="input.branch.headers"
                  :items="input.branch.history"
                  :hide-default-header="true"
                  :hide-default-footer="true"
                  :items-per-page="input.branch.history.length"
                >
                  <template v-slot:item.oid="{ item }">
                    <v-btn tile icon x-small color="green">
                      {{ item.oid.substring(0, 7) }}
                    </v-btn>
                  </template>
                </v-data-table>
              </template>
            </template>
            <template v-else>
              <v-list-item>
                <v-list-item-avatar color="grey">
                  <v-icon dark>mdi-cursor-pointer</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title class="headline">Select Remote</v-list-item-title>
                  <v-list-item-subtitle>Choose a remote to compare to the local repository</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
              <v-card-text class="text-center">&mdash;</v-card-text>
            </template>
          </v-card>
        </v-col>

      </v-row>

      <v-divider class="mt-4 mb-2"></v-divider>

      <v-row>
        <v-col>
          <v-dialog v-model="confirm" persistent max-width="600px">
            <template v-slot:activator="{ on }">
              <v-btn class="mr-4" v-on="on"
                :disabled="(input.private_key.value && input.public_key.value && input.branch.loaded ) ? false : true"
              >
                <v-icon class="mr-2">mdi-upload-multiple</v-icon>
                Push
              </v-btn>
            </template>
            <v-card>
              <v-list-item>
                <v-list-item-avatar color="orange">
                  <v-icon dark>mdi-upload-multiple</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title class="headline">Push</v-list-item-title>
                  <v-list-item-subtitle>Push completed commits up to remote repository</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
              <v-data-table
                dense disable-sort class="my-0"
                :headers="input.branch.headers"
                :items="input.branch.history"
                :hide-default-header="true"
                :hide-default-footer="true"
                :items-per-page="input.branch.history.length"
              >
                <template v-slot:item.oid="{ item }">
                  <v-btn tile icon x-small color="orange">
                    {{ item.oid.substring(0, 7) }}
                  </v-btn>
                </template>
              </v-data-table>
              <v-card-actions>
                <v-btn
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
  </v-container>

</template>

<style>
.passphrase.v-input .v-input__slot {
  min-height: 0px !important;
  border-radius: 0px;
}

.v-data-table .v-btn {
  width: 100% !important;
  height: 100% !important;
  text-align: left;
  justify-content: left;
}

.v-data-table td {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.v-data-table td:first-child {
  padding: 0px !important;
}

.v-data-table td:first-child .v-btn {
  text-align: center;
  justify-content: center;
}

.v-data-table .v-btn .v-icon {
  font-size: 14px !important;
}
</style>

<script>
import store from '@/store'
import NodeGit from 'nodegit'

export default {
  data: () => ({
    confirm: false,
    working: false,
    input: {
      remotes: {
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
        history: [],
        headers: [
          { value: 'oid', width: '100px' },
          { value: 'message', width: '' }
        ]
      }
    }
  }),
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
    await this.load_remotes()
  },
  methods: {
    assign_private_key: async function (event) {
      return this.assign_key('private_key', event)
    },
    assign_public_key: async function (event) {
      return this.assign_key('public_key', event)
    },
    assign_key: async function (name, event) {
      const files = event.target.files || event.dataTransfer.files

      if (!files.length) {
        this[name] = null
        return
      }

      if (!files[0].path) {
        return
      }

      this.input[name].value = files[0].path
    },

    credentials: function () {
      return {
        private_key: this.input.private_key.value,
        public_key: this.input.public_key.value,
        passphrase: this.input.passphrase.value || ''
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
    add_remote: async function (event) {
      await NodeGit.Remote.create(this.repository, this.input.remotes.input.name, this.input.remotes.input.url)

      await this.load_remotes()
    },
    remove_remote: function (event) {
    },
    select_remote: async function (remote) {
      this.input.remotes.value = remote

      this.input.branch.reference = null
      this.input.branch.loading = true
      this.input.branch.loaded = false

      await this.load_branch()

      this.input.branch.loading = false
    },
    load_branch: async function () {
      const remote = this.input.remotes.value

      this.input.branch.error = 'Loading ... '
      this.input.branch.history = []

      try {
        const result = await remote.object.connect(NodeGit.Enums.DIRECTION.FETCH, this.callbacks())

        if (result) { }

        (await remote.object.referenceList()).map(async reference => {
          console.log('referenceList', reference.name(), reference, reference.oid().tostrS())
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
        let remote_commit = await this.repository.getCommit(this.input.branch.reference.object.oid())

        const diff = local_commit.id().cmp(this.input.branch.reference.object.oid())

        if (diff > 0) {
          let ahead = 0

          do {
            console.log(remote_commit.id().tostrS(), '==', local_commit.id().tostrS())
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

          console.log('Ahead', ahead)
        } else if (diff < 0) {
          let behind = 0

          do {
            console.log(remote_commit.id().tostrS(), '==', local_commit.id().tostrS())
            if (local_commit.id().cmp(remote_commit.id()) === 0) {
              break
            }

            this.input.branch.history.push({
              oid: remote_commit.id().tostrS(),
              message: local_commit.message()
            })
            behind++

            if (remote_commit.parentcount() < 1) {
              throw new Error('Detached')
            }

            remote_commit = await remote_commit.parent(0)
          } while (remote_commit)

          console.log('Behind', behind)
        } else {
          console.log('Current')
        }

        this.input.branch.loaded = true
      } catch (error) {
        this.input.branch.error = error
        return
      }

      this.input.branch.error = null
    },

    push: async function (event) {
      console.debug('[Push Tome] Begin')
      this.working = true

      if (!this.input.remotes.value) {
        console.debug('[Push Tome] No Remote Selected!', this.input.remotes.value)
        this.confirm = false
        this.working = false

        return false
      }

      (await this.repository.getReferences()).map(reference => ({
        name: reference.name(),
        object: reference
      }))

      const refspec = `refs/heads/${this.branch}:refs/heads/${this.branch}`

      console.debug('[Push Tome] Collect Data', refspec)

      await this.input.remotes.value.object.push([refspec], { callbacks: this.callbacks() })

      console.debug('[Push Tome] Clear Flags')
      this.confirm = false
      this.working = false

      console.debug('[Push Tome] Complete')
      this.$emit('close')

      return true
    }

  }
}
</script>
