<template>
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
      <template #append>
        <v-btn
          ref="generate-button"
          :disabled="repository_committer.message.length > 0"
          @click="generate"
        >
          Generate
        </v-btn>
      </template>
      <commit-message-input class="my-1" />
    </v-card>
    <v-card
      class="mb-3"
      color="surface"
      title="Commit Signature"
    >
      <template #subtitle>
        Set the Name and E-Mail address for the commit message &mdash;
        <span v-if="configuration.localized.signature">changes here will also be updated in local settings.</span>
        <span v-else>changes here will also be updated in global settings.</span>
      </template>
      <template #append>
        <select-button-input
          :value="configuration.localized.signature ? SettingsTarget.Local : SettingsTarget.Global"
          :color="configuration.localized.signature ? 'secondary' : 'primary'"
          :options="signature_locality_options"
          @update="signature_locality"
        />
      </template>
      <signature-input
        :target="configuration.localized.signature ? SettingsTarget.Local : SettingsTarget.Global"
        :frame="false"
        :error="true"
      />
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
            :items="repository_committer.status.available"
            :disabled="repository_committer.process.staging"
            icon="mdi-plus-thick"
            :height="320"
            @input="stage"
            @click="diff"
          />
          <v-btn
            ref="stage-button"
            class="ma-2"
            rounded="0"
            :disabled="repository_committer.process.staging || repository_committer.status.available.length === 0"
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
            :items="repository_committer.status.staged"
            :disabled="repository_committer.process.staging"
            icon="mdi-cancel"
            :height="320"
            @input="reset"
            @click="diff"
          />
          <v-btn
            ref="reset-button"
            class="ma-2"
            rounded="0"
            :disabled="repository_committer.process.staging || repository_committer.status.staged.length === 0"
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
        :disabled="repository_committer.status.staged.length === 0"
        @click.stop="confirm"
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
    <template #overlays>
      <commit-confirm />
    </template>
  </utility-page>
</template>

<script setup lang="ts">
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import CommitError from '@/objects/errors/CommitError'
import CommitConfirm from '@/components/Commit/CommitConfirm.vue'
import CommitList from '@/components/Commit/CommitList.vue'
import CommitMessageInput from '@/components/Commit/CommitMessageInput.vue'
import SelectButtonInput, { Option as SelectButtonOption } from '@/components/Input/SelectButtonInput.vue'
import UtilityPage from '@/components/UtilityPage.vue'
import SignatureInput from '@/components/Settings/SignatureInput.vue'
import {
  VIcon,
  VCard,
  VCol,
  VBtn,
  VRow,
} from 'vuetify/components'

const configuration = fetch_configuration_store()
const system = fetch_system_store()
const repository_comparator = fetch_repository_comparator_store()
const repository_committer = fetch_repository_committer_store()

async function close () {
  await system.page({ commit: false })
}

async function generate () {
  await repository_committer.compose(undefined, true)
}

async function confirm () {
  if (await CommitError()) {
    return
  }

  await system.page({ commit_confirm: true })
}

async function diff (path) {
  await repository_comparator.diff({ path })
  await system.page({ patch: true })
}

async function stage (path) {
  await repository_committer.stage(path)
}

async function reset (path) {
  await repository_committer.reset(path)
}

const signature_locality_options: SelectButtonOption[] = [
  { value: SettingsTarget.Global, icon: 'mdi-earth' },
  { value: SettingsTarget.Local, icon: 'mdi-book' },
]

async function signature_locality (value) {
  configuration.localize('signature', value === SettingsTarget.Local)
}

defineExpose({
  close,
  confirm,
  diff,
  reset,
  stage,
  signature_locality,
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
