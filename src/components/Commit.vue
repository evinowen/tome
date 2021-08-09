<template>
  <v-navigation-drawer :value=value @input="$emit('input', $event)" fixed right stateless width="100%" style="z-index: 100; height: auto; top: 25px; bottom: 18px;">
    <v-container fluid class="pb-0" style="height: 100%;">
      <div class="d-flex flex-column align-stretch flex-grow-0" style="height: 100%; ">
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
            :value=message
            @input=update_message
            :counter="50"
            label="Message"
            required
            clearable
            auto-grow
            rows=3
            class="message"
          ></v-textarea>
        </div>

        <div v-resize=resize ref="list" class="flex-grow-1" style="min-height: 320px">
          <v-container fluid style="height: 0;">
            <v-row>
              <v-col style="width: 50vw">
                <commit-list
                  title="Available"
                  :items="available"
                  icon="mdi-plus-thick"
                  @input=stage
                  @click=diff
                  :height=offset
                />
              </v-col>

              <v-col style="width: 50vw">
                <commit-list
                  title="Staged"
                  :items="staged"
                  icon="mdi-cancel"
                  @input=reset
                  @click=diff
                  :height=offset
                />
              </v-col>
            </v-row>
          </v-container>
        </div>

        <div ref="base" class="flex-grow-0 pb-3">
          <v-container fluid>
            <v-row>
              <v-col>
                <v-btn ref="stage" tile :disabled="available.length < 1" @click.stop="stage('*')">
                  Stage All
                </v-btn>
              </v-col>
              <v-col>
                <v-btn ref="reset" tile :disabled="staged.length < 1" @click.stop="reset('*')">
                  Reset All
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </div>
        <div ref="base" class="flex-grow-0 pb-3 actions">
          <v-divider class="mb-2"></v-divider>
          <commit-confirm
            :value=confirm @input="$emit('confirm', $event)"
            @commit=commit
            @push="push = !push"
            :name="signature.name"
            :email="signature.email"
            :message="message"
            @message=update_message
            :disabled="staged.length < 1"
            :staging="staging"
            :waiting="working"
            :push=push
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

<style>
.message.v-textarea textarea {
  line-height: 1.0em !important;
  height: 15vh;
  font-size: 2.0em;
}
</style>

<style scoped>
.actions {
  backdrop-filter: blur(2px);
  position: sticky;
  bottom: 0px
}
</style>

<script>
import { DateTime } from 'luxon'
import store from '@/store'
import CommitList from '@/components/CommitList'
import CommitConfirm from '@/components/CommitConfirm'

export default {
  props: {
    value: { type: Boolean, default: false },
    confirm: { type: Boolean, default: false }
  },
  data: () => ({
    push: false,
    input: {
      name: '',
      email: '',
      message: ''
    },
    offset: 0
  }),
  mounted: function () {
    this.input.name = this.configuration.name
    this.input.email = this.configuration.email
  },
  watch: {
    confirm: async function (value) {
      if (value) {
        const name = this.input.name || this.configuration.name
        const email = this.input.email || this.configuration.email

        await store.dispatch('tome/signature', { name, email })

        if (store.state.tome.message === '') {
          await store.dispatch('tome/message', `Updates for ${DateTime.now().toISODate()}`)
        }

        this.push = store.state.configuration.auto_push
      }
    }
  },
  computed: {
    signature: function () {
      return store.state.tome.signature
    },
    message: function () {
      return store.state.tome.message
    },
    staging: function () {
      return store.state.tome.staging > 0
    },
    staged: function () {
      return store.state.tome.status.staged
    },
    available: function () {
      return store.state.tome.status.available
    },
    configuration: function () {
      return store.state.configuration
    },
    working: function () {
      return store.state.tome.commit_working
    }
  },
  methods: {
    resize: function () {
      this.offset = this.$refs.list.clientHeight
    },
    update_message: async function (message) {
      await store.dispatch('tome/message', message)
    },
    diff: async function (file) {
      await store.dispatch('tome/diff', { path: file.path })

      this.$emit('patch')
    },
    stage: async function (path) {
      await store.dispatch('tome/stage', path)
    },
    reset: async function (path) {
      await store.dispatch('tome/reset', path)
    },
    commit: async function () {
      await store.dispatch('tome/commit')

      await store.dispatch('tome/message', '')

      this.$emit('confirm', false)
      this.$emit('close')

      if (this.push) {
        this.$emit('push')
      }
    }
  },
  components: {
    CommitList,
    CommitConfirm
  }
}
</script>
