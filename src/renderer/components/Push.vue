<template>
  <utility-page
    right
    title="Push"
    :layer="1"
    :open="system.push"
    @close="close"
  >
    <div style="display: flex; flex-direction: column; flex-grow: 1; height: 100%;">
      <div class="flex-grow-0">
        <v-card
          class="mb-3"
          color="surface"
          title="Push Credentials"
          subtitle="Set credentials that will be used to push your commits to the selected remote repository"
        >
          <template #append>
            <select-button-input
              :value="configuration.localized.credentials ? SettingsTarget.Local : SettingsTarget.Global"
              :color="configuration.localized.credentials ? 'secondary' : 'primary'"
              :options="credentials_locality_options"
              @update="credentials_locality"
            />
          </template>
          <credential-selector
            :frame="false"
            :target="configuration.localized.credentials ? SettingsTarget.Local : SettingsTarget.Global"
          />
        </v-card>

        <v-card
          class="mb-3"
          color="surface"
          title="Push Remote"
          subtitle="Select which remote repository to target for this push"
        >
          <template #append>
            <v-btn @click="remotes">
              <v-icon class="mr-2">
                mdi-web
              </v-icon>
              Remotes
            </v-btn>
          </template>
          <push-remote-selector />
        </v-card>

        <v-container fluid>
          <v-row
            align="center"
            justify="center"
          >
            <v-col>
              <push-branch local />
            </v-col>

            <v-col
              cols="1"
              class="text-center pa-0 align-center"
            >
              <v-icon
                align-center
                size="x-large"
              >
                mdi-chevron-right
              </v-icon>
            </v-col>

            <v-col>
              <push-branch remote />
            </v-col>
          </v-row>
        </v-container>
      </div>

      <push-status class="flex-grow-1 mb-3" />
    </div>

    <template #actions>
      <v-btn
        class="mr-4"
        :disabled="repository_remotes.active.pending.length === 0"
        @click.stop="confirm"
      >
        <v-icon class="mr-2">
          mdi-upload-multiple
        </v-icon>
        Push
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
      <push-confirm />
    </template>
  </utility-page>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'
import PushBranch from './Push/PushBranch.vue'
import PushConfirm from './Push/PushConfirm.vue'
import PushRemoteSelector from './Push/PushRemoteSelector.vue'
import PushStatus from './Push/PushStatus.vue'
import SelectButtonInput, { Option as SelectButtonOption } from '@/components/Input/SelectButtonInput.vue'
import UtilityPage from '@/components/UtilityPage.vue'
import CredentialSelector from '@/components/Settings/Credentials/CredentialSelector.vue'
import {
  VBtn,
  VCard,
  VCol,
  VContainer,
  VIcon,
  VRow,
} from 'vuetify/components'

const configuration = fetch_configuration_store()
const system = fetch_system_store()
const repository_remotes = fetch_repository_remotes_store()

watch(() => system.push, () => {
  if (!system.push) {
    repository_remotes.clear()
  }
})

async function close () {
  await system.page({ push: false })
}

async function confirm () {
  await system.page({ push_confirm: true })
}

async function remotes () {
  await system.page({ remotes: true })
}

const credentials_locality_options: SelectButtonOption[] = [
  { value: SettingsTarget.Global, icon: 'mdi-earth' },
  { value: SettingsTarget.Local, icon: 'mdi-book' },
]

async function credentials_locality (value) {
  await configuration.localize('credentials', value === SettingsTarget.Local)
}

defineExpose({
  close,
  confirm,
  remotes,
})
</script>
