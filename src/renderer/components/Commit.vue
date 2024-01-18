<template>
  <utility-page
    right
    title="Commit"
    :layer="1"
    :open="system.commit"
    @close="close"
  >
    <div style="display: flex; flex-direction: column; height: 100%;">
      <div class="flex-grow-0">
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
            :height="320"
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
            :height="320"
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
import CommitConfirm from '@/components/CommitConfirm.vue'
import CommitList from '@/components/CommitList.vue'
import CommitListContainer from '@/components/CommitListContainer.vue'
import UtilityPage from '@/components/UtilityPage.vue'
import {
  VIcon,
  VBtn,
  VTextField,
  VTextarea,
} from 'vuetify/components'

export default {
  components: {
    CommitConfirm,
    CommitList,
    CommitListContainer,
    UtilityPage,
    VBtn,
    VIcon,
    VTextarea,
    VTextField,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

const system = computed(() => store.state.system)
const repository = computed(() => store.state.repository)
const staging = computed(() => store.state.repository.staging > 0)
const staged = computed(() => store.state.repository.status.staged)
const available = computed(() => store.state.repository.status.available)
const configuration = computed(() => store.state.configuration)
const working = computed(() => store.state.repository.commit_working)

async function sign_name (value) {
  await store.dispatch('system/signature/name', value)
}

async function sign_email (value) {
  await store.dispatch('system/signature/email', value)
}

async function sign_message (value) {
  await store.dispatch('system/signature/message', value)
}

async function close () {
  await store.dispatch('system/commit', false)
}

async function confirm (value) {
  await store.dispatch('system/commit_confirm', value)
}

async function push (value) {
  await store.dispatch('system/commit_push', value)
}

async function message (message) {
  await store.dispatch('repository/message', message)
}

async function diff (path) {
  await store.dispatch('repository/diff', { path })
  await store.dispatch('system/patch', true)
}

async function stage (path) {
  await store.dispatch('repository/stage', path)
}

async function reset (path) {
  await store.dispatch('repository/reset', path)
}

async function commit () {
  await store.dispatch('system/perform', 'commit')
}

defineExpose({
  close,
  commit,
  confirm,
  diff,
  message,
  push,
  reset,
  sign_email,
  sign_message,
  sign_name,
  stage,
})
</script>

<style scoped>
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
