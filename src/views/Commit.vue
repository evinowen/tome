<template>
  <v-container style="height: 100%; padding: 0px;">
    <v-container class="pa-4" style="height: 100%; overflow: auto;">
      <v-row no-gutters>
        <v-col>
          <h1>Commit</h1>
        </v-col>
        <v-col col=1 class="text-right">
          <v-btn tile icon color="red" @click.stop="$emit('close')">
            <v-icon>mdi-window-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <hr />
      <v-row>
        <v-col>
          <v-card>
            <v-card-title class="pa-2">
              Available
            </v-card-title>
            <v-data-table dense
              :headers="headers"
              :items="available"
              :sort-by="['file']"
              :hide-default-footer="true"
              :items-per-page="available.length"
              class="my-2"
            >
              <template v-slot:item.type="{ item }">
                <v-chip label small
                  class="ma-1 px-2 text-center"
                  :color="item.color"
                  text-color="white"
                  style="width: 100%;"
                >
                  <v-icon small class="mr-1">{{ item.icon }}</v-icon>
                  {{ item.type }}
                </v-chip>

              </template>

              <template v-slot:item.action="{ item }">
                <v-btn tile icon @click.stop="stage(item.path)">
                  <v-icon>mdi-plus-thick</v-icon>
                </v-btn>

              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col>
          <v-card>
            <v-card-title class="pa-2">
              Staged
            </v-card-title>
            <v-data-table
              :headers="headers"
              :items="staged"
              :items-per-page="staged.length"
              :sort-by="['file']"
              :hide-default-footer="true"
              dense class="my-2"
            >
              <template v-slot:item.type="{ item }">
                <v-chip label small
                  class="ma-1 px-2 text-center"
                  :color="item.color"
                  text-color="white"
                  style="width: 100%;"
                >
                  <v-icon small class="mr-1">{{ item.icon }}</v-icon>
                  {{ item.type }}
                </v-chip>

              </template>


              <template v-slot:item.action="{ item }">
                <v-btn tile x-small icon @click.stop="reset(item.path)">
                  <v-icon>mdi-cancel</v-icon>
                </v-btn>

              </template>
            </v-data-table>
          </v-card>
        </v-col>

      </v-row>


      <v-row>
        <v-col>

        <v-text-field
          v-model="input.name"
          label="Name"
          :placeholder="default_name"
          required
        ></v-text-field>
        <v-text-field
          v-model="input.email"
          label="E-mail"
          :placeholder="default_email"
          required
        ></v-text-field>
        <v-textarea
          v-model="input.message"
          :counter="50"
          label="Message"
          required
          clearable
          auto-grow
          rows=1
          style="font-size: 2.5em; line-height: 1.2em !important;"
        ></v-textarea>

        </v-col>
      </v-row>

      <v-divider class="mt-4 mb-2"></v-divider>

      <v-row>
        <v-col>
          <v-dialog v-model="confirm" persistent max-width="1200px">
            <template v-slot:activator="{ on }">
              <v-btn class="mr-4" v-on="on">
                <v-icon class="mr-2">mdi-content-save</v-icon>
                Save
              </v-btn>
            </template>
            <v-card>
              <v-card-title class="headline">{{ input.message }}</v-card-title>
              <v-card-text class="text-right">{{ input.name || default_name }} &lt;{{ input.email || default_email }}&gt;</v-card-text>
              <v-card-actions>
                <v-btn
                  color="orange darken-1"
                  text @click="commit"
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
</style>

<script>
  import { remote } from 'electron';
  import NodeGit from 'nodegit'

  const fs = remote.require('fs');
  const path = remote.require('path');

  export default {
    props: {
      repository: { type: NodeGit.Repository },
      staged: { type: Array },
      available: { type: Array },
      default_name: { type: String, default: '' },
      default_email: { type: String, default: '' },
    },
    data: () => ({
      confirm: false,
      working: false,
      input: {
        name: '',
        email: '',
        message: '',
      },
      headers: [
        { text: 'File', value: 'path' },
        { text: 'Type', value: 'type', align: 'right' },
        { text: '', value: 'action', align: 'right'},
      ],

    }),
    computed: {
    },
    methods: {
      stage: async function (file_path) {
        console.log(`stage path ${file_path}`);

        let index = await this.repository.refreshIndex();

        {
          let result = await index.addByPath(file_path);

          if (result) {
            console.error(`Failed to add ${file_path} to index`, result);
            return;

          }

        }

        {
          let result = await index.write();

          if (result) {
            console.error(`Failed to write ${file_path} index`, result);
            return;

          }

        }

        return true;

      },

      reset: async function (file_path) {
        console.log(`reset path ${file_path}`);

        let index = await this.repository.refreshIndex();

        {
          let result = await index.removeByPath(file_path);

          if (result) {
            console.error(`Failed to reset ${file_path}`, result);
            return;

          }

        }

        {
          let result = await index.write();

          if (result) {
            console.error(`Failed to write ${file_path} index`, result);
            return;

          }

        }

        return await this.reload_run();

      },

      commit: async function () {
        console.debug("[Commit Tome] Begin");
        this.working = true;

        if (!this.repository) {
          console.debug("Attempting to commit on non-existent repository.");

        }

        console.debug("[Commit Tome] Load Prerequisites.");
        let index = await this.repository.refreshIndex();
        let oid = await index.writeTree();
        let parents = []

        if (!this.repository.headUnborn()) {
          console.debug("[Commit Tome] Head born, fetch as parent.");
          let head = await NodeGit.Reference.nameToId(this.repository, "HEAD");
          let parent = await this.repository.getCommit(head);

          parents.push(parent);

        }

        console.debug("[Commit Tome] Create Signature");
        let signature = NodeGit.Signature.now(this.input.name || this.default_name,  this.input.email || this.default_email);

        console.debug("[Commit Tome] Await commit ... ");
        let commit = await this.repository.createCommit("HEAD", signature, signature, this.input.message, oid, parents);

        console.debug("[Commit Tome] Committed", commit);

        console.debug("[Commit Tome] Clear Flags");
        this.confirm = false;
        this.working = false;

        console.debug("[Commit Tome] Complete");
        this.$emit('close');

        return true;

      },

    }
  }
</script>