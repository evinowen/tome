<template>
  <v-navigation-drawer
    :model-value="system.commit"
    width="900"
    location="right"
    @update:model-value="$event || close"
  >
    <v-container
      fluid
      class="pb-0"
      style="height: 100%;"
    >
      <div
        class="d-flex flex-column align-stretch flex-grow-0"
        style="height: 100%; "
      >
        <div class="flex-grow-0">
          <div>
            <v-btn
              rounded="0"
              icon
              class="float-right"
              color="black"
              @click.stop="close"
            >
              <v-icon>mdi-window-close</v-icon>
            </v-btn>
            <h1>Commit</h1>
          </div>
          <div style="clear: both" />
          <v-text-field
            :model-value="repository.signature.name"
            :placeholder="configuration.name"
            label="Name"
            required
            density="compact"
            persistent-placeholder
            @update:model-value="sign_name"
          />
          <v-text-field
            :model-value="repository.signature.email"
            :placeholder="configuration.email"
            label="E-mail"
            required
            density="compact"
            persistent-placeholder
            @update:model-value="sign_email"
          />
          <v-textarea
            persistent-placeholder
            :model-value="repository.signature.message"
            :counter="50"
            label="Message"
            required
            clearable
            auto-grow
            rows="3"
            class="message"
            @update:model-value="sign_message"
          />
        </div>

        <div
          ref="list"
          v-resize="resize"
          class="flex-grow-1"
          style="min-height: 320px"
        >
          <v-container
            fluid
            style="height: 0;"
          >
            <v-row>
              <v-col style="width: 50vw">
                <commit-list
                  title="Available"
                  :items="available"
                  icon="mdi-plus-thick"
                  :height="offset"
                  @input="stage"
                  @click="diff"
                />
              </v-col>

              <v-col style="width: 50vw">
                <commit-list
                  title="Staged"
                  :items="staged"
                  icon="mdi-cancel"
                  :height="offset"
                  @input="reset"
                  @click="diff"
                />
              </v-col>
            </v-row>
          </v-container>
        </div>

        <div
          ref="base"
          class="flex-grow-0 pb-3"
        >
          <v-container fluid>
            <v-row>
              <v-col>
                <v-btn
                  ref="stage"
                  rounded="0"
                  :disabled="available.length === 0"
                  @click.stop="stage('*')"
                >
                  Stage All
                </v-btn>
              </v-col>
              <v-col>
                <v-btn
                  ref="reset"
                  rounded="0"
                  :disabled="staged.length === 0"
                  @click.stop="reset('*')"
                >
                  Reset All
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </div>
        <div
          ref="base"
          class="flex-grow-0 pb-3 actions"
        >
          <v-divider class="mb-2" />
          <commit-confirm
            :value="system.commit_confirm"
            :name="repository.signature.name"
            :email="repository.signature.email"
            :message="repository.signature.message"
            :disabled="staged.length === 0"
            :staging="staging"
            :waiting="working"
            :push="system.commit_push"
            @input="confirm"
            @commit="commit"
            @push="push"
            @message="sign_message"
          />
          <v-btn
            color="warning"
            @click.stop="close"
          >
            <v-icon class="mr-2">
              mdi-cancel
            </v-icon>
            Cancel
          </v-btn>
        </div>
      </div>
    </v-container>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Vue, Setup, toNative } from 'vue-facing-decorator'
import {
  VContainer,
  VIcon,
  VBtn,
  VRow,
  VCol,
  VDivider,
  VNavigationDrawer,
  VTextField,
  VTextarea
} from 'vuetify/components'
import { Resize } from 'vuetify/directives'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'
import CommitList from '@/components/CommitList.vue'
import CommitConfirm from '@/components/CommitConfirm.vue'

@Component({
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
})
class Commit extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  $refs: {
    list: HTMLElement
  }

  offset = 0

  get system () {
    return this.store.state.system
  }

  get repository () {
    return this.store.state.repository
  }

  get staging () {
    return this.store.state.repository.staging > 0
  }

  get staged () {
    return this.store.state.repository.status.staged
  }

  get available () {
    return this.store.state.repository.status.available
  }

  get configuration () {
    return this.store.state.configuration
  }

  get working () {
    return this.store.state.repository.commit_working
  }

  async sign_name (value) {
    await this.store.dispatch('system/signature/name', value)
  }

  async sign_email (value) {
    await this.store.dispatch('system/signature/email', value)
  }

  async sign_message (value) {
    await this.store.dispatch('system/signature/message', value)
  }

  async close () {
    await this.store.dispatch('system/commit', false)
  }

  async confirm (value) {
    await this.store.dispatch('system/commit_confirm', value)
  }

  async push (value) {
    await this.store.dispatch('system/commit_push', value)
  }

  resize () {
    this.offset = this.$refs.list.clientHeight
  }

  async message (message) {
    await this.store.dispatch('repository/message', message)
  }

  async diff (file) {
    await this.store.dispatch('repository/diff', { path: file.path })
    await this.store.dispatch('system/patch', true)
  }

  async stage (path) {
    await this.store.dispatch('repository/stage', path)
  }

  async reset (path) {
    await this.store.dispatch('repository/reset', path)
  }

  async commit () {
    await this.store.dispatch('system/perform', 'commit')
  }
}

export default toNative(Commit)
</script>

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
