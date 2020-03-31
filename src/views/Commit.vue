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
                <v-btn tile icon x-small :color="item.color">
                  <v-icon small class="mr-1">{{ item.icon }}</v-icon>
                  {{ item.type }}
                </v-btn>
              </template>

              <template v-slot:item.action="{ item }">
                <v-btn tile icon x-small @click.stop="stage(item.path)">
                  <v-icon>mdi-plus-thick</v-icon>
                </v-btn>

              </template>
            </v-data-table>
          </v-card>
          <v-btn tile :disabled="available.length < 1" @click.stop="stage('*')">
            Stage All
          </v-btn>
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
                <v-btn tile icon x-small :color="item.color">
                  <v-icon small class="mr-1">{{ item.icon }}</v-icon>
                  {{ item.type }}
                </v-btn>
              </template>

              <template v-slot:item.action="{ item }">
                <v-btn tile icon x-small @click.stop="reset(item.path)">
                  <v-icon>mdi-cancel</v-icon>
                </v-btn>

              </template>
            </v-data-table>
          </v-card>
          <v-btn tile :disabled="staged.length < 1" @click.stop="reset('*')">
            Reset All
          </v-btn>
        </v-col>

      </v-row>

      <v-row>
      </v-row>

      <v-divider class="mt-4 mb-2"></v-divider>

      <v-row>
        <v-col cols=10>
          <v-text-field
            v-model="input.name"
            label="Name"
            :placeholder="configuration.name"
            required small
          ></v-text-field>
          <v-text-field
            v-model="input.email"
            label="E-mail"
            :placeholder="configuration.email"
            required small
          ></v-text-field>
          <v-textarea
            v-model="input.message"
            :counter="50"
            label="Message"
            required
            clearable
            auto-grow
            rows=3
            class="message"
          ></v-textarea>
        </v-col>
        <v-col cols=2 class="text-right">
          <v-container class="mt-2">
          <v-dialog v-model="confirm" persistent max-width="600px">
            <template v-slot:activator="{ on }">
              <v-btn class="mr-4" v-on="on" style="width: 100%" :disabled="staged.length < 1">
                <v-icon class="mr-2">mdi-content-save</v-icon>
                Save
              </v-btn>
            </template>
            <v-card>
              <v-list-item>
                <v-list-item-avatar color="red">
                  <v-icon dark>mdi-hammer-wrench</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title class="headline">Commit</v-list-item-title>
                  <v-list-item-subtitle>Commit is prepared and ready to publish</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
              <v-card-text class="commit">
                {{ input.message }}
              </v-card-text>
              <v-divider></v-divider>
              <v-container class="author text-right">
              {{ input.name || configuration.name }} &lt;{{ input.email || configuration.email }}&gt;
              </v-container>
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
          </v-container>
          <v-container>
            <v-btn color="red" @click.stop="$emit('close')" style="width: 100%">
              <v-icon class="mr-2">mdi-cancel</v-icon>
              Cancel
            </v-btn>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </v-container>

</template>

<style>
.v-data-table td {
  padding: 0 !important;
  font-size: 10px !important;
}

.v-data-table td:first-child {
  padding: 0 6px !important;
}

.v-data-table th:last-child {
  padding: 0 !important;
}

.v-data-table .v-btn {
  width: 100% !important;
  height: 100% !important;
  text-align: left;
  justify-content: left;
  color: white;
}

.v-data-table td:last-child .v-btn{
  text-align: center;
  justify-content: center;
}

.v-data-table .v-btn .v-icon {
  font-size: 14px !important;
}

.message {
  height: 100px;
}

.message.v-textarea textarea {
  line-height: 1.0em !important;
  font-size: 2.0em;
}

.commit {
  font-family: monospace;
  min-height: 120px;
  padding: 0 4px !important;
  font-size: 24px;
  line-height: 1.0em !important;
  background: repeating-linear-gradient(
    to bottom,
    #EFEFEF,
    #EFEFEF 24px,
    #F8F8F8 24px,
    #F8F8F8 48px
  );
}

.author {
  font-family: monospace;
  font-size: 1.2em;
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
      name: '',
      email: '',
      message: ''
    },
    headers: [
      { text: 'File', value: 'path', width: '' },
      { text: 'Type', value: 'type', width: '70px' },
      { text: '', value: 'action', width: '23px', sortable: false }
    ]
  }),
  computed: {
    repository: function () {
      return store.state.tome.repository
    },
    staged: function () {
      return store.state.tome.status.staged.items
    },
    available: function () {
      return store.state.tome.status.available.items
    },
    configuration: function () {
      return store.state.tome_config
    }
  },
  methods: {
    stage: async function (file_path) {
      const index = await this.repository.refreshIndex()

      if (file_path === '*') {
        for (let i = 0; i < this.available.length; i++) {
          await index.addByPath(this.available[i].path)
        }
      } else {
        const result = await index.addByPath(file_path)

        if (result) {
          console.error(`Failed to add ${file_path} to index`, result)
          return
        }
      }

      {
        const result = await index.write()

        if (result) {
          console.error(`Failed to write ${file_path} index`, result)
          return
        }
      }

      await store.dispatch('inspect')
    },

    reset: async function (file_path) {
      const index = await this.repository.refreshIndex()
      const head = await this.repository.getBranchCommit(await this.repository.head())

      if (file_path === '*') {
        for (let i = 0; i < this.staged.length; i++) {
          await NodeGit.Reset.default(this.repository, head, this.staged[i].path)
        }
      } else {
        const result = await NodeGit.Reset.default(this.repository, head, file_path)

        if (result) {
          console.error(`Failed to reset ${file_path}`, result)
          return
        }
      }

      {
        const result = await index.write()

        if (result) {
          console.error(`Failed to write ${file_path} index`, result)
          return
        }
      }

      await store.dispatch('inspect')
    },

    commit: async function () {
      console.debug('[Commit Tome] Begin')
      this.working = true

      if (!this.repository) {
        console.debug('Attempting to commit on non-existent repository.')
      }

      console.debug('[Commit Tome] Load Prerequisites.')
      const index = await this.repository.refreshIndex()
      const oid = await index.writeTree()
      const parents = []

      if (!this.repository.headUnborn()) {
        console.debug('[Commit Tome] Head born, fetch as parent.')
        const head = await NodeGit.Reference.nameToId(this.repository, 'HEAD')
        const parent = await this.repository.getCommit(head)

        parents.push(parent)
      }

      console.debug('[Commit Tome] Create Signature')
      const signature = NodeGit.Signature.now(this.input.name || this.configuration.name, this.input.email || this.configuration.email)

      console.debug('[Commit Tome] Await commit ... ')
      const commit = await this.repository.createCommit('HEAD', signature, signature, this.input.message, oid, parents)

      console.debug('[Commit Tome] Committed', commit)

      console.debug('[Commit Tome] Clear Flags')
      this.confirm = false
      this.working = false

      console.debug('[Commit Tome] Complete')
      this.$emit('close')

      return true
    }

  }
}
</script>
