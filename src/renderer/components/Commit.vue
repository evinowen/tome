<template>
  <div>
    <utility-page
      right
      title="Commit"
      :layer="1"
      :open="system.commit"
      @close="close"
    >
      <v-card
        class="mb-3"
        color="surface"
        title="Commit Message"
        subtitle="Set the message that will be used for the new commit, this can be anything that describes what updates have been made since the last commit."
      >
        <message-input
          class="my-1"
          :value="repository.signature.message"
          :signature_name="configuration.name"
          :signature_email="configuration.email"
          @update="sign_message"
        />
      </v-card>
      <v-card
        class="mb-3"
        color="surface"
        title="Commit Signature"
        subtitle="Set the Name and E-Mail address for the commit message &mdash; changes here will also be updated in the global settings."
      >
        <v-row
          dense
          no-gutters
          class="mt-0"
        >
          <v-col
            class="xs"
            cols="12"
            sm="6"
          >
            <text-input
              label="name"
              index="name"
            />
          </v-col>
          <v-col
            class="xs"
            cols="12"
            sm="6"
          >
            <text-input
              label="e-mail"
              index="email"
            />
          </v-col>
        </v-row>
      </v-card>
      <v-card
        color="surface"
        title="Commit Changes"
        subtitle="Select from the available updates what changes should be added to this commit."
        class="d-flex flex-grow-1 flex-column"
      >
        <v-row
          dense
          class="d-flex flex-grow-1 flex-shrink-1 px-2"
          style="min-height: 320px; "
        >
          <v-col
            class="d-flex flex-column"
            cols="12"
            sm="6"
          >
            <div class="text-h6 text-center pt-3">
              Available
            </div>
            <commit-list
              style="flex-grow: 1;"
              title="Available"
              :items="available"
              icon="mdi-plus-thick"
              :height="320"
              @input="stage"
              @click="diff"
            />
            <v-btn
              ref="stage-button"
              class="ma-2"
              rounded="0"
              :disabled="available.length === 0"
              @click.stop="stage('*')"
            >
              Stage All
            </v-btn>
          </v-col>
          <v-col
            class="d-flex flex-column"
            cols="12"
            sm="6"
          >
            <div class="text-h6 text-center pt-3">
              Staged
            </div>
            <commit-list
              style="flex-grow: 1;"
              title="Staged"
              :items="staged"
              icon="mdi-cancel"
              :height="320"
              @input="reset"
              @click="diff"
            />
            <v-btn
              ref="reset-button"
              class="ma-2"
              rounded="0"
              :disabled="staged.length === 0"
              @click.stop="reset('*')"
            >
              Reset All
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
      <template #actions>
        <v-btn
          class="mr-4"
          :disabled="staged.length === 0"
          @click.stop="confirm(true)"
        >
          <v-icon class="mr-2">
            mdi-content-save
          </v-icon>
          Save
        </v-btn>
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
    <commit-confirm
      :visible="system.commit_confirm"
      :name="configuration.name"
      :email="configuration.email"
      :message="repository.signature.message"
      :staging="staging"
      :waiting="working"
      :push="system.commit_push"
      @close="confirm(false)"
      @commit="commit"
      @push="push"
      @message="sign_message"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'
import CommitConfirm from '@/components/CommitConfirm.vue'
import CommitList from '@/components/CommitList.vue'
import UtilityPage from '@/components/UtilityPage.vue'
import MessageInput from '@/components/Input/MessageInput.vue'
import TextInput from '@/components/Settings/TextInput.vue'
import {
  VIcon,
  VCard,
  VCol,
  VBtn,
  VRow,
} from 'vuetify/components'

const store = fetchStore()

const system = computed(() => store.state.system)
const repository = computed(() => store.state.repository)
const staging = computed(() => store.state.repository.staging > 0)
const staged = computed(() => store.state.repository.status.staged)
const available = computed(() => store.state.repository.status.available)
const configuration = computed(() => store.state.configuration)
const working = computed(() => store.state.repository.commit_working)

async function sign_name (value) {
  await store.dispatch('repository/signature/name', value)
}

async function sign_email (value) {
  await store.dispatch('repository/signature/email', value)
}

async function sign_message (value) {
  await store.dispatch('repository/signature/message', value)
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
