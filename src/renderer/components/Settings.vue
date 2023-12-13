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
        <v-text-field
          density="compact"
          label="name"
          :model-value="configuration.name"
          @update:model-value="assign_value('name', $event)"
        />
      </v-col>
      <v-col
        class="xs"
        sm="6"
      >
        <v-text-field
          density="compact"
          label="e-mail"
          :model-value="configuration.email"
          @update:model-value="assign_value('email', $event)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col
        class="xs"
        sm="12"
      >
        <keyfile-input
          id="settings_private_key"
          label="private key"
          :value="configuration.private_key"
          forge
          @input="assign_value('private_key', $event)"
          @forge="generate_key(configuration.passphrase)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col>
        <v-text-field
          :model-value="configuration.passphrase"
          label="passphrase"
          density="compact"
          clearable
          :append-icon="obscure_passphrase ? 'mdi-eye-off' : 'mdi-eye'"
          :type="obscure_passphrase ? 'password' : 'text'"
          @click:append="obscure_passphrase = !obscure_passphrase"
          @update:model-value="assign_value('passphrase', $event)"
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
        <v-switch
          :model-value="configuration.auto_push"
          label="Automatic Push"
          @update:model-value="assign_value('auto_push', $event || false)"
        />
      </v-col>
      <v-col
        class="xs"
        sm="7"
        md="9"
        lg="12"
      >
        <v-text-field
          density="compact"
          label="default remote"
          :model-value="configuration.default_remote"
          @update:model-value="assign_value('default_remote', $event)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col>
        <h3>Display Options</h3>
        <v-switch
          :model-value="configuration.format_titles"
          label="Format Titles"
          @update:model-value="assign_value('format_titles', $event || false)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col>
        <h3>Theme Colors</h3>
        <v-switch
          :model-value="configuration.dark_mode"
          label="Dark Mode"
          @update:model-value="assign_value('dark_mode', $event || false)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col
        class="xs"
        sm="12"
        md="12"
        lg="4"
      >
        <theme-preview />
      </v-col>
      <v-col>
        <v-container>
          <template v-if="configuration.dark_mode">
            <v-row dense>
              <v-col>
                <theme-color-picker
                  color="primary"
                  :value="configuration.dark_primary"
                  :enabled="configuration.dark_primary_enabled"
                  :base="color_base('dark', 'primary')"
                  @enabled="assign_value('dark_primary_enabled', $event)"
                  @input="assign_value('dark_primary', $event || '#000000')"
                />
              </v-col>
              <v-col>
                <theme-color-picker
                  color="secondary"
                  :value="configuration.dark_secondary"
                  :enabled="configuration.dark_secondary_enabled"
                  :base="color_base('dark', 'secondary')"
                  @enabled="assign_value('dark_secondary_enabled', $event)"
                  @input="assign_value('dark_secondary', $event || '#000000')"
                />
              </v-col>
              <v-col>
                <theme-color-picker
                  color="accent"
                  :value="configuration.dark_accent"
                  :enabled="configuration.dark_accent_enabled"
                  :base="color_base('dark', 'accent')"
                  @enabled="assign_value('dark_accent_enabled', $event)"
                  @input="assign_value('dark_accent', $event || '#000000')"
                />
              </v-col>
            </v-row>
            <v-row dense>
              <v-col>
                <theme-color-picker
                  color="error"
                  :value="configuration.dark_error"
                  :enabled="configuration.dark_error_enabled"
                  :base="color_base('dark', 'error')"
                  @enabled="assign_value('dark_error_enabled', $event)"
                  @input="assign_value('dark_error', $event || '#000000')"
                />
              </v-col>
              <v-col>
                <theme-color-picker
                  color="info"
                  :value="configuration.dark_info"
                  :enabled="configuration.dark_info_enabled"
                  :base="color_base('dark', 'info')"
                  @enabled="assign_value('dark_info_enabled', $event)"
                  @input="assign_value('dark_info', $event || '#000000')"
                />
              </v-col>
              <v-col>
                <theme-color-picker
                  color="success"
                  :value="configuration.dark_success"
                  :enabled="configuration.dark_success_enabled"
                  :base="color_base('dark', 'success')"
                  @enabled="assign_value('dark_success_enabled', $event)"
                  @input="assign_value('dark_success', $event || '#000000')"
                />
              </v-col>
              <v-col>
                <theme-color-picker
                  color="warning"
                  :value="configuration.dark_warning"
                  :enabled="configuration.dark_warning_enabled"
                  :base="color_base('dark', 'warning')"
                  @enabled="assign_value('dark_warning_enabled', $event)"
                  @input="assign_value('dark_warning', $event || '#000000')"
                />
              </v-col>
            </v-row>
          </template>
          <template v-else>
            <v-row dense>
              <v-col>
                <theme-color-picker
                  color="primary"
                  :value="configuration.light_primary"
                  :enabled="configuration.light_primary_enabled"
                  :base="color_base('light', 'primary')"
                  @enabled="assign_value('light_primary_enabled', $event)"
                  @input="assign_value('light_primary', $event || '#000000')"
                />
              </v-col>
              <v-col>
                <theme-color-picker
                  color="secondary"
                  :value="configuration.light_secondary"
                  :enabled="configuration.light_secondary_enabled"
                  :base="color_base('light', 'secondary')"
                  @enabled="assign_value('light_secondary_enabled', $event)"
                  @input="assign_value('light_secondary', $event || '#000000')"
                />
              </v-col>
              <v-col>
                <theme-color-picker
                  color="accent"
                  :value="configuration.light_accent"
                  :enabled="configuration.light_accent_enabled"
                  :base="color_base('light', 'accent')"
                  @enabled="assign_value('light_accent_enabled', $event)"
                  @input="assign_value('light_accent', $event || '#000000')"
                />
              </v-col>
            </v-row>
            <v-row dense>
              <v-col>
                <theme-color-picker
                  color="error"
                  :value="configuration.light_error"
                  :enabled="configuration.light_error_enabled"
                  :base="color_base('light', 'error')"
                  @enabled="assign_value('light_error_enabled', $event)"
                  @input="assign_value('light_error', $event || '#000000')"
                />
              </v-col>
              <v-col>
                <theme-color-picker
                  color="info"
                  :value="configuration.light_info"
                  :enabled="configuration.light_info_enabled"
                  :base="color_base('light', 'info')"
                  @enabled="assign_value('light_info_enabled', $event)"
                  @input="assign_value('light_info', $event || '#000000')"
                />
              </v-col>
              <v-col>
                <theme-color-picker
                  color="success"
                  :value="configuration.light_success"
                  :enabled="configuration.light_success_enabled"
                  :base="color_base('light', 'success')"
                  @enabled="assign_value('light_success_enabled', $event)"
                  @input="assign_value('light_success', $event || '#000000')"
                />
              </v-col>
              <v-col>
                <theme-color-picker
                  color="warning"
                  :value="configuration.light_warning"
                  :enabled="configuration.light_warning_enabled"
                  :base="color_base('light', 'warning')"
                  @enabled="assign_value('light_warning_enabled', $event)"
                  @input="assign_value('light_warning', $event || '#000000')"
                />
              </v-col>
            </v-row>
          </template>
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
                <img :src="logo" style="height: 64px; width: 64px;">
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
import KeyfileInput from './KeyfileInput.vue'
import KeyfileOutput from './KeyfileOutput.vue'
import SeaGame from './SeaGame.vue'
import ThemeColorPicker from './ThemeColorPicker.vue'
import ThemePreview from './ThemePreview.vue'
import UtilityPage from './UtilityPage.vue'
import {
  VBtn,
  VCol,
  VContainer,
  VDivider,
  VLayout,
  VRow,
  VSwitch,
  VTextField,
} from 'vuetify/components'

export default {
  components: {
    KeyfileInput,
    KeyfileOutput,
    SeaGame,
    ThemeColorPicker,
    ThemePreview,
    UtilityPage,
    VBtn,
    VCol,
    VContainer,
    VDivider,
    VLayout,
    VRow,
    VSwitch,
    VTextField,
  }
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { debounce } from 'lodash'
import { fetchStore } from '@/store'
import { presets } from '@/vuetify'

import logo_url from './logo.png'

const store = fetchStore()

const obscure_passphrase = ref(true)

const logo = computed(() => {
  return logo_url
})

const configuration = computed(() => store.state.configuration)
const system = computed(() => store.state.system)

function color_base (theme, color) {
  if (color in presets[theme]) {
    return presets[theme][color]
  }

  return '#000000'
}

async function close () {
  await store.dispatch('system/settings', false)
}

async function assign_value (name, value) {
  await store.dispatch('configuration/update', { [name]: value })
  debounce_save()
}

async function generate_key (passphrase) {
  await store.dispatch('configuration/generate', passphrase)
}

async function save () {
  await store.dispatch('configuration/write', store.state.configuration_path)
}

const debounce_save = debounce(save, 1000)
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
