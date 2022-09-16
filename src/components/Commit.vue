<template>
  <v-navigation-drawer :value=system.commit @input="$event || close" fixed right stateless width="100%" style="z-index: 100; max-width: 900px; height: auto; top: 25px; bottom: 18px;">
    <v-container fluid class="pb-0" style="height: 100%;">
      <div class="d-flex flex-column align-stretch flex-grow-0" style="height: 100%; ">
        <div class="flex-grow-0">
          <div>
            <v-btn tile icon class="float-right" color="black" @click.stop=close>
              <v-icon>mdi-window-close</v-icon>
            </v-btn>
            <h1>Commit</h1>
          </div>
          <div style="clear: both" ></div>
          <v-text-field
            :value=system.signature.name
            :placeholder=configuration.name
            @input=sign_name
            label="Name"
            required small persistent-placeholder
          ></v-text-field>
          <v-text-field
            :value=system.signature.email
            :placeholder=configuration.email
            @input=sign_email
            label="E-mail"
            required small persistent-placeholder
          ></v-text-field>
          <v-textarea persistent-placeholder
            :value=system.signature.message
            @input=sign_message
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
            :value=system.commit_confirm @input=confirm
            @commit=commit
            @push=push
            :name=tome.signature.name
            :email=tome.signature.email
            :message=tome.signature.message
            @message=sign_message
            :disabled="staged.length < 1"
            :staging="staging"
            :waiting="working"
            :push=system.commit_push
          />
          <v-btn color="warning" @click.stop=close>
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
import {
  VContainer,
  VIcon,
  VBtn,
  VRow,
  VCol,
  VDivider,
  VNavigationDrawer,
  VTextField,
  VTextarea,
  Resize
} from 'vuetify/lib'
import store from '@/store'
import CommitList from '@/components/CommitList'
import CommitConfirm from '@/components/CommitConfirm'

export default {
  data: () => ({
    offset: 0
  }),
  computed: {
    system: function () {
      return store.state.system
    },
    tome: function () {
      return store.state.tome
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
    sign_name: async function (value) {
      await store.dispatch('system/signature/name', value)
    },
    sign_email: async function (value) {
      await store.dispatch('system/signature/email', value)
    },
    sign_message: async function (value) {
      await store.dispatch('system/signature/message', value)
    },
    close: async function () {
      await store.dispatch('system/commit', false)
    },
    confirm: async function (value) {
      await store.dispatch('system/commit_confirm', value)
    },
    push: async function (value) {
      await store.dispatch('system/commit_push', value)
    },
    resize: function () {
      this.offset = this.$refs.list.clientHeight
    },
    message: async function (message) {
      await store.dispatch('tome/message', message)
    },
    diff: async function (file) {
      await store.dispatch('tome/diff', { path: file.path })
      await store.dispatch('system/patch', true)
    },
    stage: async function (path) {
      await store.dispatch('tome/stage', path)
    },
    reset: async function (path) {
      await store.dispatch('tome/reset', path)
    },
    commit: async function () {
      await store.dispatch('system/perform', 'commit')
    }
  },
  components: {
    VContainer,
    VIcon,
    VBtn,
    VRow,
    VCol,
    VDivider,
    VNavigationDrawer,
    VTextField,
    VTextarea,
    CommitList,
    CommitConfirm
  },
  directives: {
    Resize
  }
}
</script>
