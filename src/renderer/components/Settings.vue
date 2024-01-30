<template>
  <utility-page
    left
    title="Settings"
    :layer="10"
    :open="system.settings"
    @close="close"
  >
    <v-row>
      <v-col>
        <h3>User Credentials</h3>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col
        class="xs"
        sm="6"
      >
        <text-input
          label="name"
          index="name"
        />
      </v-col>
      <v-col
        class="xs"
        sm="6"
      >
        <text-input
          label="e-mail"
          index="email"
        />
      </v-col>
    </v-row>
    <v-row dense>
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
    <v-row dense>
      <v-col>
        <text-input
          label="passphrase"
          index="passphrase"
          obscureable
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col>
        <keyfile-output
          label="public key"
          :value="configuration.public_key"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col>
        <h3>Commit Options</h3>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col
        class="xs"
        sm="5"
        md="3"
        lg="2"
      >
        <boolean-input
          label="Automatic Push"
          index="auto_push"
        />
      </v-col>
      <v-col
        class="xs"
        sm="7"
        md="9"
        lg="12"
      >
        <text-input
          label="default remote"
          index="default_remote"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col>
        <h3>Display Options</h3>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col>
        <boolean-input
          label="Format Titles"
          index="format_titles"
        />
      </v-col>
      <v-col>
        <boolean-input
          label="Dark Mode"
          index="dark_mode"
        />
      </v-col>
    </v-row>
    <v-row dense />
    <theme-preview />
    <v-row dense>
      <v-col>
        <v-container>
          <v-row dense>
            <v-col>
              <theme-color-picker
                :theme="theme"
                color="primary"
              />
            </v-col>
            <v-col>
              <theme-color-picker
                :theme="theme"
                color="secondary"
              />
            </v-col>
            <v-col>
              <theme-color-picker
                :theme="theme"
                color="accent"
              />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col>
              <theme-color-picker
                :theme="theme"
                color="error"
              />
            </v-col>
            <v-col>
              <theme-color-picker
                :theme="theme"
                color="info"
              />
            </v-col>
            <v-col>
              <theme-color-picker
                :theme="theme"
                color="success"
              />
            </v-col>
            <v-col>
              <theme-color-picker
                :theme="theme"
                color="warning"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-col>
    </v-row>
    <v-divider class="mt-4 mb-5" />
    <v-row>
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
