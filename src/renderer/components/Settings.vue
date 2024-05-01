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
      <keyfile-input
        label="private key"
        index="private_key"
      />
      <text-input
        label="passphrase"
        index="passphrase"
        obscureable
      />
      <keyfile-output
        label="public key"
        :value="configuration.public_key"
      />
    </v-card>
    <v-divider class="py-2" />
    <v-card
      title="Commit Options"
      subtitle="Options for how Tome should handle or react to Commit operations"
    >
      <boolean-input
        label="Automatic Push"
        detail="Push commits to the defined default remote once a commit is created"
        index="auto_push"
      />
      <text-input
        label="default remote"
        index="default_remote"
      />
    </v-card>
    <v-divider class="py-2" />
    <v-card
      color="surface"
      title="Interface Options"
      subtitle="Interface display and interaction options"
    >
      <div class="ma-1">
        <v-btn
          block
          @click="edit_theme"
        >
          Theme Editor
        </v-btn>
      </div>
      <boolean-input
        label="Dark Mode"
        detail="Use a dark color scheme to reduce brightness level of the interface"
        index="dark_mode"
      />
      <boolean-input
        label="Format Titles"
        detail="Display entry titles as formatted, with underscores replaced with spaces and each word capitalized"
        index="format_titles"
      />
      <boolean-input
        label="System Objects"
        detail="Display system files and directories in explorer, such as the .git and .tome directories"
        index="system_objects"
      />
      <boolean-input
        label="Drag + Drop"
        detail="Enable dragging of files and folders to new parent directories"
        index="draggable_objects"
      />
      <boolean-input
        label="Line Numbers"
        detail="Display line numbers in the composition view while editing documents"
        index="line_numbers"
      />
      <option-input
        label="Explorer Position"
        detail="Dock the file explorer on the left or the right"
        index="explorer_position"
        :options="explorer_position_options"
      />
      <number-input
        label="Explorer Width"
        detail="Specify the width of the file explorer"
        index="explorer_width"
      />
      <number-input
        label="Resize Control Width"
        detail="Specify the width of the control bar that resizes file explorer and viewport"
        index="resize_width"
      />
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
import BooleanInput from './Settings/BooleanInput.vue'
import NumberInput from './Settings/NumberInput.vue'
import OptionInput, { Option } from './Settings/OptionInput.vue'
import KeyfileInput from './Settings/KeyfileInput.vue'
import KeyfileOutput from './KeyfileOutput.vue'
import TextInput from './Settings/TextInput.vue'
import UtilityPage from './UtilityPage.vue'
import SeaGame from './SeaGame.vue'
import {
  VBtn,
  VCard,
  VCol,
  VDivider,
  VRow,
} from 'vuetify/components'

const explorer_position_options = [
  { value: 'left', icon: 'mdi-dock-left' },
  { value: 'right', icon: 'mdi-dock-right' },
] as Option[]

export default {
  components: {
    BooleanInput,
    OptionInput,
    KeyfileInput,
    KeyfileOutput,
    SeaGame,
    TextInput,
    UtilityPage,
    VBtn,
    VCard,
    VCol,
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
