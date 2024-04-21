<template>
  <utility-page
    left
    title="Settings"
    :layer="10"
    :open="system.settings"
    @close="close"
  >
    <v-card
      color="surface"
      title="User Credentials"
      subtitle="Credentials provided here are used for Commits and for Pushing content to your remote repository"
    >
      <v-row dense no-gutters class="mt-0">
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
      <v-row dense no-gutters class="mt-0">
        <v-col
          class="xs"
          sm="12"
        >
          <keyfile-input
            label="private key"
            index="private_key"
          />
        </v-col>
      </v-row>
      <v-row dense no-gutters class="mt-0">
        <v-col>
          <text-input
            label="passphrase"
            index="passphrase"
            obscureable
          />
        </v-col>
      </v-row>
      <v-row dense no-gutters class="mt-0">
        <v-col>
          <keyfile-output
            label="public key"
            :value="configuration.public_key"
          />
        </v-col>
      </v-row>
    </v-card>
    <v-divider class="py-2" />
    <v-card
      title="Commit Options"
      subtitle="Options for how Tome should handle or react to Commit operations"
    >
      <v-row dense no-gutters class="mt-0">
        <v-col
          class="xs"
          cols="12"
        >
          <boolean-input
            label="Automatic Push"
            detail="Push commits to the defined default remote once a commit is created"
            index="auto_push"
          />
        </v-col>
      </v-row>
      <v-row dense no-gutters class="mt-0">
        <v-col>
          <text-input
            label="default remote"
            index="default_remote"
          />
        </v-col>
      </v-row>
    </v-card>
    <v-divider class="py-2" />
    <v-card
      color="surface"
      title="Display Options"
      subtitle="Interface display and interaction options"
    >
      <v-row dense>
        <v-col class="mx-2">
          <v-btn block @click="edit_theme">Theme Editor</v-btn>
        </v-col>
      </v-row>
      <v-row dense no-gutters class="mt-0">
        <v-col>
          <boolean-input
            label="Dark Mode"
            detail="Use a dark color scheme to reduce brightness level of the interface"
            index="dark_mode"
          />
        </v-col>
      </v-row>
      <v-row dense no-gutters class="mt-0">
        <v-col>
          <boolean-input
            label="Format Titles"
            detail="Display entry titles as formatted, with underscores replaced with spaces and each word capitalized"
            index="format_titles"
          />
        </v-col>
      </v-row>
    </v-card>
    <template #footer>
      <v-divider class="my-2" />
      <v-row class="flex-shrink-0">
        <v-col>
          <div class="d-flex">
            <div class="flex-shrink-1">
              <div class="tome-badge">
                <div class="tome-badge-logo">
                  <img
                    :src="logo"
                    style="height: 64px; width: 64px;"
                  >
                </div>
                <div class="tome-badge-data">
                  <h3>Tome</h3>
                  <span style="white-space: nowrap;">
                    version {{ system.version }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex-grow-1">
              <sea-game />
            </div>
            <div
              v-if="system.process"
              class="flex-shrink-1"
              style="font-size: 0.8em; text-align: right; opacity: 0.6;"
            >
              <b>electron</b> {{ system.process.versions.electron }}<br>
              <b>chromium</b> {{ system.process.versions.chrome }}<br>
              <b>node</b> {{ system.process.versions.node }}<br>
              <b>v8</b> {{ system.process.versions.v8 }}<br>
              <v-divider />
              <b>sandboxed</b> {{ system.process.sandboxed ? 'true' : 'false' }}<br>
            </div>
          </div>
        </v-col>
      </v-row>
    </template>
  </utility-page>
</template>

<script lang="ts">
import KeyfileInput from './Settings/KeyfileInput.vue'
import KeyfileOutput from './KeyfileOutput.vue'
import SeaGame from './SeaGame.vue'
import BooleanInput from './Settings/BooleanInput.vue'
import TextInput from './Settings/TextInput.vue'
import ThemeColorPicker from './Settings/ThemeColorPicker.vue'
import ThemePreview from './Settings/ThemePreview.vue'
import UtilityPage from './UtilityPage.vue'
import {
  VBtn,
  VCard,
  VCol,
  VContainer,
  VDivider,
  VRow,
} from 'vuetify/components'

export default {
  components: {
    BooleanInput,
    KeyfileInput,
    KeyfileOutput,
    SeaGame,
    TextInput,
    ThemeColorPicker,
    ThemePreview,
    UtilityPage,
    VBtn,
    VCard,
    VCol,
    VContainer,
    VDivider,
    VRow,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'
import logo from './logo.png'

const store = fetchStore()

const configuration = computed(() => store.state.configuration)
const system = computed(() => store.state.system)

const theme = computed(() => configuration.value.dark_mode ? 'dark' : 'light')

async function close () {
  await store.dispatch('system/settings', false)
}

async function edit_theme () {
  await store.dispatch('system/theme_editor', true)
}

defineExpose({
  close,
})
</script>

<style scoped>
.tome-badge {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
  margin: auto;
  width: 200px;
  padding: 6px;
  text-align: center;
}

.tome-badge-logo {
  flex-grow: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tome-badge-data {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
</style>
