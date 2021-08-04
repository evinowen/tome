<template>
  <v-navigation-drawer :value=value @input="$emit('input', $event)" fixed stateless width="100%" style="z-index: 1000; height: auto; top: 25px; bottom: 18px">
    <v-container fluid class="pb-0" style="height: 100%;">
      <v-row>
        <v-col>
          <h3>User Credentials</h3>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col xs=12 sm=6>
          <v-text-field small label="name" :value=configuration.name @input="assign_value('name', $event)" />
        </v-col>
        <v-col xs=12 sm=6>
          <v-text-field small label="e-mail" :value=configuration.email @input="assign_value('email', $event)" />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col xs=12 sm=6>
          <keyfile-input label="private key" id="settings_private_key" :value=configuration.private_key @input=assign_key />
        </v-col>
        <v-col xs=12 sm=6>
          <keyfile-input label="public key" id="settings_public_key" :value=configuration.public_key @input=assign_key />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col>
          <v-text-field
            :value=configuration.passphrase
            label="passphrase" small clearable
            :append-icon="obscure_passphrase ? 'mdi-eye-off' : 'mdi-eye'"
            :type="obscure_passphrase ? 'password' : 'text'"
            @click:append="obscure_passphrase = !obscure_passphrase"
            @change=debounce_save
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col>
          <h3>Display Options</h3>
          <v-switch :input-value=configuration.format_titles label="Format Titles" @change="assign_value('format_titles', $event || false)"></v-switch>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col>
          <h3>Theme Colors</h3>
          <v-switch :input-value=configuration.dark_mode label="Dark Mode" @change="assign_value('dark_mode', $event || false)"></v-switch>
        </v-col>
      </v-row>
      <v-row dense>
        <v-col xs=12 sm=12 md=12 lg=4>
          <theme-preview />
        </v-col>
        <v-col>
          <v-container>
            <template v-if=configuration.dark_mode>
              <v-row dense>
                <v-col>
                  <theme-color-picker
                    color="primary"
                    :value=configuration.dark_primary
                    :enabled=configuration.dark_primary_enabled
                    @enabled="assign_value('dark_primary_enabled', $event)"
                    @input="assign_value('dark_primary', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="secondary"
                    :value=configuration.dark_secondary
                    :enabled=configuration.dark_secondary_enabled
                    @enabled="assign_value('dark_secondary_enabled', $event)"
                    @input="assign_value('dark_secondary', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="accent"
                    :value=configuration.dark_accent
                    :enabled=configuration.dark_accent_enabled
                    @enabled="assign_value('dark_accent_enabled', $event)"
                    @input="assign_value('dark_accent', $event || '#000000')"
                  />
                </v-col>
              </v-row>
              <v-row dense>
                <v-col>
                  <theme-color-picker
                    color="error"
                    :value=configuration.dark_error
                    :enabled=configuration.dark_error_enabled
                    @enabled="assign_value('dark_error_enabled', $event)"
                    @input="assign_value('dark_error', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="info"
                    :value=configuration.dark_info
                    :enabled=configuration.dark_info_enabled
                    @enabled="assign_value('dark_info_enabled', $event)"
                    @input="assign_value('dark_info', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="success"
                    :value=configuration.dark_success
                    :enabled=configuration.dark_success_enabled
                    @enabled="assign_value('dark_success_enabled', $event)"
                    @input="assign_value('dark_success', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="warning"
                    :value=configuration.dark_warning
                    :enabled=configuration.dark_warning_enabled
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
                    :value=configuration.light_primary
                    :enabled=configuration.light_primary_enabled
                    @enabled="assign_value('light_primary_enabled', $event)"
                    @input="assign_value('light_primary', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="secondary"
                    :value=configuration.light_secondary
                    :enabled=configuration.light_secondary_enabled
                    @enabled="assign_value('light_secondary_enabled', $event)"
                    @input="assign_value('light_secondary', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="accent"
                    :value=configuration.light_accent
                    :enabled=configuration.light_accent_enabled
                    @enabled="assign_value('light_accent_enabled', $event)"
                    @input="assign_value('light_accent', $event || '#000000')"
                  />
                </v-col>
              </v-row>
              <v-row dense>
                <v-col>
                  <theme-color-picker
                    color="error"
                    :value=configuration.light_error
                    :enabled=configuration.light_error_enabled
                    @enabled="assign_value('light_error_enabled', $event)"
                    @input="assign_value('light_error', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="info"
                    :value=configuration.light_info
                    :enabled=configuration.light_info_enabled
                    @enabled="assign_value('light_info_enabled', $event)"
                    @input="assign_value('light_info', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="success"
                    :value=configuration.light_success
                    :enabled=configuration.light_success_enabled
                    @enabled="assign_value('light_success_enabled', $event)"
                    @input="assign_value('light_success', $event || '#000000')"
                  />
                </v-col>
                <v-col>
                  <theme-color-picker
                    color="warning"
                    :value=configuration.light_warning
                    :enabled=configuration.light_warning_enabled
                    @enabled="assign_value('light_warning_enabled', $event)"
                    @input="assign_value('light_warning', $event || '#000000')"
                  />
                </v-col>
              </v-row>
            </template>
          </v-container>
        </v-col>
      </v-row>
      <v-row class="mb-3"></v-row>
      <div ref="base" class="pb-3 actions">
        <v-divider class="mt-0 mb-2"></v-divider>
        <v-btn small color="primary" @click.stop="$emit('input', false)">
          Done
        </v-btn>
      </div>
    </v-container>
  </v-navigation-drawer>
</template>

<style>
.key-input {
  width: 100% !important;
  padding: 0;
  height: 48px !important;
  font-size: 0.9em !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.key-input .v-icon {
  height: 28px !important;
  width: 28px !important;
  font-size: 2.0em !important;
}

.key-input span {
  width: 100% !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  justify-content: normal;
}

.actions {
  backdrop-filter: blur(2px);
  position: sticky;
  bottom: 0px
}
</style>

<script>
import { debounce } from 'lodash'
import store from '@/store'
import ThemePreview from './ThemePreview.vue'
import KeyfileInput from './KeyfileInput.vue'
import ThemeColorPicker from './ThemeColorPicker.vue'

export default {
  props: {
    value: { type: Boolean, default: false }
  },
  data: () => ({
    obscure_passphrase: true
  }),
  computed: {
    configuration: function () {
      return store.state.configuration
    },
    debounce_save: function () {
      return debounce(this.save, 1000)
    }
  },
  methods: {
    assign_key: async function (name, event) {
      const files = event.target.files || event.dataTransfer.files

      const file = files.length ? files[0] : null

      await store.dispatch('configuration/update', { [name]: file.path })
      this.debounce_save()
    },
    assign_value: async function (name, value) {
      await store.dispatch('configuration/update', { [name]: value })
      this.debounce_save()
    },
    save: async function () {
      await store.dispatch('configuration/write', store.state.configuration_path)
    }
  },
  components: {
    KeyfileInput,
    ThemePreview,
    ThemeColorPicker
  }
}
</script>
