<template>
  <v-navigation-drawer v-model=open @input="$emit('input', $event)" dark fixed right stateless width="100%" style="height: auto; top: 25px; bottom: 18px">
    <v-container fluid class="pa-4">
      <v-row no-gutters>
        <v-col>
          <h1>Commit</h1>
        </v-col>
        <v-col col=1 class="text-right">
          <v-btn tile icon color="black" @click.stop="$emit('close')">
            <v-icon>mdi-window-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row style="max-height: 50vh; overflow-y: scroll">
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
          <v-btn ref="stage" tile :disabled="available.length < 1" @click.stop="stage('*')">
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
          <v-btn ref="reset" tile :disabled="staged.length < 1" @click.stop="reset('*')">
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
            <commit-confirm
              v-model=confirm
              @commit=commit
              :name="input.name || configuration.name"
              :email="input.email || configuration.email"
              :message="input.message"
              :disabled="staged.length < 1"
              :waiting="working"
            />
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
  </v-navigation-drawer>
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
</style>

<script>
import store from '@/store'
import CommitConfirm from '@/components/CommitConfirm'

export default {
  props: {
    value: { type: Boolean, default: false }
  },
  data: () => ({
    open: false,
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
    staged: function () {
      return store.state.tome.status.staged.items
    },
    available: function () {
      return store.state.tome.status.available.items
    },
    configuration: function () {
      return store.state.configuration
    }
  },
  watch: {
    value: function (value) { this.open = value }
  },
  methods: {
    stage: async function (path) {
      await store.dispatch('tome/stage', path)
    },
    reset: async function (path) {
      await store.dispatch('tome/reset', path)
    },
    commit: async function () {
      this.working = true

      const name = this.input.name || this.configuration.name
      const email = this.input.email || this.configuration.email
      const message = this.input.message

      await store.dispatch('tome/commit', name, email, message)

      this.confirm = false
      this.working = false

      this.$emit('close')

      return true
    }
  },
  components: {
    CommitConfirm
  }
}
</script>
