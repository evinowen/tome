<template>
  <v-navigation-drawer v-model=open @input="$emit('input', $event)" dark fixed right stateless width="100%" style="height: auto; top: 25px; bottom: 18px">
    <v-container fluid style="height: 100%;">
      <div class="d-flex flex-column align-stretch justify-start flex-grow-0" style="min-height: 100%">
        <div class="flex-grow-0">
          <div>
            <v-btn tile icon class="float-right" color="black" @click.stop="$emit('close')">
              <v-icon>mdi-window-close</v-icon>
            </v-btn>
            <h1>Commit</h1>
          </div>
          <div style="clear: both" ></div>
          <v-text-field
            v-model="input.name"
            label="Name"
            required small
          ></v-text-field>
          <v-text-field
            v-model="input.email"
            label="E-mail"
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
          <v-container fluid>
            <v-row>
              <v-col style="width: 50vw">
                <commit-list
                  title="Available"
                  :items="available"
                  icon="mdi-plus-thick"
                  @input=stage
                  height="35vh"
                />
                <v-btn ref="stage" tile :disabled="available.length < 1" @click.stop="stage('*')">
                  Stage All
                </v-btn>
              </v-col>

              <v-col style="width: 50vw">
                <commit-list
                  title="Staged"
                  :items="staged"
                  icon="mdi-cancel"
                  @input=reset
                  height="35vh"
                />
                <v-btn ref="reset" tile :disabled="staged.length < 1" @click.stop="reset('*')">
                  Reset All
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </div>

        <div style="margin-top: auto">
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
        </div>
      </div>
    </v-container>
  </v-navigation-drawer>
</template>

<style>
.message.v-textarea textarea {
  line-height: 1.0em !important;
  height: 15vh;
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
  mounted: function () {
    this.input.name = this.configuration.name
    this.input.email = this.configuration.email
  },
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
      this.input.message = ''

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
