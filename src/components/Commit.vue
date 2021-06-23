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
      <v-row>
        <v-col>
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
      </v-row>
      <v-row style="max-height: 50vh; overflow-y: scroll">
        <v-col>
          <commit-list
            title="Available"
            :items="available"
            icon="mdi-plus-thick"
            @input=stage
          />
          <v-btn ref="stage" tile :disabled="available.length < 1" @click.stop="stage('*')">
            Stage All
          </v-btn>
        </v-col>

        <v-col>
          <commit-list
            title="Staged"
            :items="staged"
            icon="mdi-cancel"
            @input=reset
          />
          <v-btn ref="reset" tile :disabled="staged.length < 1" @click.stop="reset('*')">
            Reset All
          </v-btn>
        </v-col>

      </v-row>

      <v-divider class="mt-4 mb-2"></v-divider>

      <commit-confirm
        v-model=confirm
        @commit=commit
        :name="input.name || configuration.name"
        :email="input.email || configuration.email"
        :message="input.message"
        :disabled="staged.length < 1"
        :waiting="working"
      />
      <v-btn color="red" @click.stop="$emit('close')">
        <v-icon class="mr-2">mdi-cancel</v-icon>
        Cancel
      </v-btn>
    </v-container>
  </v-navigation-drawer>
</template>

<style>
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
import CommitList from '@/components/CommitList'
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
    }
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
    CommitList,
    CommitConfirm
  }
}
</script>
