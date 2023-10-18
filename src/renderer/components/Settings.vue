<template>
  <v-navigation-drawer
    :model-value="value"
    width="900"
    location="left"
    @update:model-value="$event || close"
  >
    <v-container
      fluid
      class="pb-0"
      style="height: 100%;"
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
            @change="assign_value('passphrase', $event)"
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
                    @enabled="assign_value('dark_primary_enabled', $event)"
                    @input="assign_value('dark_primary', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="secondary"
                    :value="configuration.dark_secondary"
                    :enabled="configuration.dark_secondary_enabled"
                    @enabled="assign_value('dark_secondary_enabled', $event)"
                    @input="assign_value('dark_secondary', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="accent"
                    :value="configuration.dark_accent"
                    :enabled="configuration.dark_accent_enabled"
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
                    @enabled="assign_value('dark_error_enabled', $event)"
                    @input="assign_value('dark_error', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="info"
                    :value="configuration.dark_info"
                    :enabled="configuration.dark_info_enabled"
                    @enabled="assign_value('dark_info_enabled', $event)"
                    @input="assign_value('dark_info', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="success"
                    :value="configuration.dark_success"
                    :enabled="configuration.dark_success_enabled"
                    @enabled="assign_value('dark_success_enabled', $event)"
                    @input="assign_value('dark_success', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="warning"
                    :value="configuration.dark_warning"
                    :enabled="configuration.dark_warning_enabled"
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
                    @enabled="assign_value('light_primary_enabled', $event)"
                    @input="assign_value('light_primary', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="secondary"
                    :value="configuration.light_secondary"
                    :enabled="configuration.light_secondary_enabled"
                    @enabled="assign_value('light_secondary_enabled', $event)"
                    @input="assign_value('light_secondary', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="accent"
                    :value="configuration.light_accent"
                    :enabled="configuration.light_accent_enabled"
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
                    @enabled="assign_value('light_error_enabled', $event)"
                    @input="assign_value('light_error', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="info"
                    :value="configuration.light_info"
                    :enabled="configuration.light_info_enabled"
                    @enabled="assign_value('light_info_enabled', $event)"
                    @input="assign_value('light_info', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="success"
                    :value="configuration.light_success"
                    :enabled="configuration.light_success_enabled"
                    @enabled="assign_value('light_success_enabled', $event)"
                    @input="assign_value('light_success', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="warning"
                    :value="configuration.light_warning"
                    :enabled="configuration.light_warning_enabled"
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
          <v-layout>
            <v-col class="shrink">
              <v-layout class="tome">
                <v-col
                  class="shrink"
                  style="text-align: center;"
                >
                  <img :src="logo">
                </v-col>
                <v-col
                  class="grow justify-center"
                  align-self-center
                >
                  <h3>Tome</h3>
                  version {{ system.version }}
                </v-col>
              </v-layout>
            </v-col>
            <v-col class="grow">
              <sea-game />
            </v-col>
            <v-col
              v-if="system.process"
              class="shrink"
              style="font-size: 0.8em; text-align: right; opacity: 0.6;"
            >
              <b>electron</b> {{ system.process.versions.electron }}<br>
              <b>chromium</b> {{ system.process.versions.chrome }}<br>
              <b>node</b> {{ system.process.versions.node }}<br>
              <b>v8</b> {{ system.process.versions.v8 }}<br>
              <v-divider />
              <b>sandboxed</b> {{ system.process.sandboxed ? 'true' : 'false' }}<br>
            </v-col>
          </v-layout>
        </v-col>
      </v-row>
      <v-row class="mb-3" />
      <div
        ref="base"
        class="pb-3 actions"
      >
        <v-divider class="mt-0 mb-2" />
        <v-btn
          size="small"
          color="primary"
          @click.stop="close"
        >
          Done
        </v-btn>
      </div>
    </v-container>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Prop, Vue, Setup, toNative } from 'vue-facing-decorator'
import { VLayout, VCol, VRow, VBtn, VDivider, VContainer, VSwitch, VTextField, VNavigationDrawer } from 'vuetify/components'
import { debounce } from 'lodash'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'
import ThemePreview from './ThemePreview.vue'
import KeyfileInput from './KeyfileInput.vue'
import KeyfileOutput from './KeyfileOutput.vue'
import ThemeColorPicker from './ThemeColorPicker.vue'
import SeaGame from './SeaGame.vue'

import logo_url from './logo.png'

@Component({
  components: {
    VCol,
    VRow,
    VBtn,
    VDivider,
    VContainer,
    VSwitch,
    VTextField,
    VNavigationDrawer,
    KeyfileInput,
    KeyfileOutput,
    ThemePreview,
    ThemeColorPicker,
    VLayout,
    SeaGame
  }
})
class Settings extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  @Prop({ default: false })
  value: boolean

  obscure_passphrase = true
  version?: string
  process?: {
    versions?: Record<string, string>
    sandboxed: boolean
  }

  get logo () {
    return logo_url
  }

  get configuration () {
    return this.store.state.configuration
  }

  get system () {
    return this.store.state.system
  }

  get debounce_save () {
    return debounce(this.save, 1000)
  }

  async close () {
    await this.store.dispatch('system/settings', false)
  }

  async assign_value (name, value) {
    await this.store.dispatch('configuration/update', { [name]: value })
    this.debounce_save()
  }

  async generate_key (passphrase) {
    await this.store.dispatch('configuration/generate', passphrase)
  }

  async save () {
    await this.store.dispatch('configuration/write', this.store.state.configuration_path)
  }
}

export default toNative(Settings)
</script>

<style scoped>
.tome {
  background: rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
  margin: auto;
  width: 200px;
  padding: 6px;
  text-align: center;
}

.actions {
  backdrop-filter: blur(2px);
  bottom: 0px;
  position: sticky;
}
</style>
