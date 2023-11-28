<template>
  <utility-page
    right
    :open="system.commit"
    @close="close"
  >
    <div style="display: flex; flex-direction: column; height: 100%;">
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

      <commit-list-container class="mb-2">
        <template #left>
          Available
        </template>
        <template #right>
          Staged
        </template>
      </commit-list-container>

      <commit-list-container
        grow
        :height="320"
      >
        <template #left>
          <commit-list
            style="flex-grow: 1;"
            title="Available"
            :items="available"
            icon="mdi-plus-thick"
            :height="offset"
            @input="stage"
            @click="diff"
          />
        </template>
        <template #right>
          <commit-list
            style="flex-grow: 1;"
            title="Staged"
            :items="staged"
            icon="mdi-cancel"
            :height="offset"
            @input="reset"
            @click="diff"
          />
        </template>
      </commit-list-container>

      <commit-list-container>
        <template #left>
          <v-btn
            ref="stage"
            class="ma-2"
            rounded="0"
            :disabled="available.length === 0"
            @click.stop="stage('*')"
          >
            Stage All
          </v-btn>
        </template>
        <template #right>
          <v-btn
            ref="reset"
            class="ma-2"
            rounded="0"
            :disabled="staged.length === 0"
            @click.stop="reset('*')"
          >
            Reset All
          </v-btn>
        </template>
      </commit-list-container>
    </div>
    <template #actions>
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
    </template>
  </utility-page>
</template>

<script lang="ts">
import { Component, Vue, Setup, toNative } from 'vue-facing-decorator'
import {
  VContainer,
  VLayout,
  VIcon,
  VBtn,
  VRow,
  VCol,
  VTextField,
  VTextarea
} from 'vuetify/components'
import { Resize } from 'vuetify/directives'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'
import UtilityPage from '@/components/UtilityPage.vue'
import CommitList from '@/components/CommitList.vue'
import CommitListContainer from '@/components/CommitListContainer.vue'
import CommitConfirm from '@/components/CommitConfirm.vue'

@Component({
  components: {
    CommitConfirm,
    CommitList,
    CommitListContainer,
    UtilityPage,
    VBtn,
    VCol,
    VContainer,
    VLayout,
    VIcon,
    VRow,
    VTextarea,
    VTextField,
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

  async diff (path) {
    await this.store.dispatch('repository/diff', { path })
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

.change-list-container {
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  min-height: 320px;
  overflow-y: auto;
}

.change-list {
  display: flex;
  flex-direction: column;
  width: 50vw;
}
</style>
