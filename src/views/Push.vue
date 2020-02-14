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
            <v-row no-gutters>
              <v-col>
                <input ref="private_key" type="file" style="display: none" @change="assign_private_key" />
                <v-btn tile icon small dark :color="input.private_key.value ? 'green' : 'red'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="$refs.private_key.click();">
                  <v-icon small>{{ input.private_key.value ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
                  {{ input.private_key.value }}
                </v-btn>
              </v-col>
              <v-col cols=1>
                <v-btn tile icon small dark :color="default_private_key ? 'orange' : 'grey'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="input.private_key.value = default_private_key">
                  <v-icon small>mdi-key</v-icon>
                </v-btn>
              </v-col>

            </v-row>


            <v-row no-gutters>
              <v-col>
                <input ref="public_key" type="file" style="display: none" @change="assign_public_key" />
                <v-btn tile icon small dark :color="input.public_key.value ? 'green' : 'red'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="$refs.public_key.click();">
                  <v-icon small>{{ input.public_key.value ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
                  {{ input.public_key.value }}
                </v-btn>
              </v-col>
              <v-col cols=1>
                <v-btn tile icon small dark :color="default_public_key ? 'orange' : 'grey'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="input.public_key.value = default_public_key">
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
                <v-btn tile icon small dark :color="default_passphrase ? 'orange' : 'grey'" class="pa-0" style="width: 100%; text-align: left;" @click.stop="input.passphrase.value = default_passphrase">
                  <v-icon small>mdi-key</v-icon>
                </v-btn>
              </v-col>

            </v-row>

            <v-card-actions>
              <v-select
                :items="input.remotes.list"
                label="Remote"
                @change="select_remote"
                :disabled="(input.private_key.value && input.public_key.value) ? false : true"
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

      <v-row>
        <v-col>
          <v-dialog v-model="confirm" persistent max-width="1200px">
            <template v-slot:activator="{ on }">
              <v-btn class="mr-4" v-on="on"
                :disabled="(input.private_key.value && input.public_key.value && input.remotes.value ) ? false : true"
              >
                <v-icon class="mr-2">mdi-upload-multiple</v-icon>
                Push
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="headline">Push</v-card-title>
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

</style>

<script>
  import { remote } from 'electron';
  import NodeGit from 'nodegit'

  export default {
    props: {
      repository: { type: NodeGit.Repository },
      branch: { type: String, default: '' },
      default_private_key: { type: String, default: '' },
      default_public_key: { type: String, default: '' },
      default_passphrase: { type: String, default: '' },
    },
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
            url: '',
          },
        },
        private_key: {
          value: '',
          obscured: false,
        },
        public_key: {
          value: '',
          obscured: false,
        },
        passphrase: {
          value: '',
          obscured: false,
        },
        branch: {
          loading: false,
        },
      },
      headers: [
        { text: 'File', value: 'path' },
        { text: 'Type', value: 'type', align: 'right' },
        { text: '', value: 'action', align: 'right'},
      ],

    }),
    computed: {
    },
    mounted: async function() {
        await this.load_remotes();
    },
    methods: {
      assign_private_key: async function (event) {
        return this.assign_key('private_key', event);

      },
      assign_public_key: async function (event) {
        return this.assign_key('public_key', event);

      },
      assign_key: async function (name, event) {
        console.log('assign_key', name, event);
        let files = event.target.files || event.dataTransfer.files;

        console.log(files);

        if (!files.length) {
          this[name] = null;
          return;

        }

        if (!files[0].path) {
          return;

        }

        this.input[name].value = files[0].path;

        console.log('private_key', this.input.private_key.value);
        console.log('public_key', this.input.public_key.value);

      },

      credentials: function () {
        console.log('private_key', this.input.private_key.value);
        console.log('public_key', this.input.public_key.value);
        console.log('passphrase', this.input.passphrase.value);

        return {
          private_key: this.input.private_key.value,
          public_key: this.input.public_key.value,
          passphrase: this.input.passphrase.value || '',
        };

      },

      callbacks: function () {
        let credentials = this.credentials();

        return {
          credentials: function(url, username) {
            console.log('credentials', username, credentials.public_key, credentials.private_key, credentials.passphrase);
            return NodeGit.Cred.sshKeyNew(username, credentials.public_key, credentials.private_key, credentials.passphrase);
          },

          certificateCheck: () => 0,

        };

      },

      load_remotes: async function () {
        let items = await this.repository.getRemotes();

        console.log("loaded remotes", items);

        this.input.remotes.list = items.map(remote => ({
          name: remote.name(),
          url: remote.url(),
          object: remote,
        }));

        console.log("compiled remotes", this.input.remotes.list);

      },
      add_remote: async function (event) {
        console.log("add_remote", event);
        console.log(this.input.remotes.input.name, this.input.remotes.input.url);

        let remote = await NodeGit.Remote.create(this.repository, this.input.remotes.input.name, this.input.remotes.input.url);

        await this.load_remotes();

      },
      remove_remote: function (event) {
        console.log("remove_remote", event);

      },
      select_remote: async function (remote) {
        console.log("select_remote", remote);

        this.input.remotes.value = null;

        this.input.branch.reference = null;
        this.input.branch.loading = true;

        if (remote) {
          try {
            let result = await remote.object.connect(NodeGit.Enums.DIRECTION.FETCH, this.callbacks());

            if (result) {
              console.error('remote connect error', result);

            }

            console.log("getFetchRefspecs?", await remote.object.getFetchRefspecs());
            console.log("getPushRefspecs?", await remote.object.getPushRefspecs());

            console.log("referenceList?", (await remote.object.referenceList()).map(reference => {
              let object = {
                name: reference.name(),
                object: reference,

              };

              let parsed = reference.name().match(/^refs\/heads\/(.*)$/m);
              console.log(parsed);

              if (parsed) {
                object.short = parsed[1];

                if (object.short == this.branch) {
                  this.input.branch.reference = object;
                }

              }

              return object;

            }));

            this.input.remotes.value = remote;

          } catch (err) {
              console.error('remote connect error!!!', err);

          }

        }

        this.input.branch.loading = false;

        return true;

      },

      push: async function (event) {
        console.debug("[Push Tome] Begin");
        this.working = true;

        if (!this.input.remotes.value) {
          console.debug("[Push Tome] No Remote Selected!", this.input.remotes.value);
          this.confirm = false;
          this.working = false;

          return false;

        }

        let references = (await this.repository.getReferences()).map(reference => ({
          name: reference.name(),
          object: reference,

        }));

        console.log("[Push Tome] List local references:", references);

        let refspec = `refs/heads/${this.branch}:refs/heads/${this.branch}`;

        console.debug("[Push Tome] Collect Data", refspec);

        let result = await this.input.remotes.value.object.push([refspec], { callbacks: this.callbacks() });

        console.debug("[Push Tome] Clear Flags");
        this.confirm = false;
        this.working = false;

        console.debug("[Push Tome] Complete");
        this.$emit('close');

        return true;

      },

    }
  }
</script>