<template>
  <utility-page
    left
    title="Settings"
    :layer="10"
    :open="system.settings"
    @close="close"
  >
    <v-tabs
      :model-value="configuration.target"
      align-tabs="center"
      stacked
      grow
      @update:model-value="(value: SettingsTarget) => configuration.view(value)"
    >
      <v-tab
        :value="SettingsTarget.Global"
      >
        <v-icon>mdi-earth</v-icon>
        Global
      </v-tab>
      <v-tab
        :value="SettingsTarget.Local"
        :disabled="!repository.ready"
      >
        <v-icon>mdi-book</v-icon>
        Local
      </v-tab>
    </v-tabs>
    <v-card
      :title="locality_title"
      :subtitle="locality_subtitle"
      class="my-3"
      :color="locality_color"
    >
      <v-card-text v-if="configuration.target === SettingsTarget.Global">
        Configuration is stored in the global configuration file for the current user, which is loaded each time Tome is started.
        These settings will be applied whenever there is no override set by local configuration.
      </v-card-text>
      <v-card-text v-if="configuration.target === SettingsTarget.Local">
        Configuration is stored in the repository <code>.tome</code> directory as <code>config.json</code> and loaded alongside the current repository.
        The contents will be not be available for staging to a commit, keeping these settings local to the current machine.
      </v-card-text>
    </v-card>
    <v-card
      class="mb-3"
      color="surface"
      title="User Credentials"
      subtitle="Credentials provided here are used for Commits and for Pushing content to your remote repository"
    >
      <signature-input />
      <credential-selector />
    </v-card>
    <v-card
      class="mb-3"
      title="Commit Options"
      subtitle="Options for how Tome should handle or react to Commit operations"
    >
      <div
        v-if="configuration.target === 'global'"
        class="mx-4 my-1"
      >
        <v-icon
          color="warning"
          class="mr-1"
        >
          mdi-alert-box
        </v-icon>
        Consider using local configuration when enabling Automatic Commit settings.
      </div>
      <boolean-input
        label="Automatic Commit"
        detail="Create a commit on the current branch automatically when a change has been made at a configured time internal"
        index="auto_commit"
      />
      <select-menu-input
        label="Automatic Commit Interval"
        detail="How often to create automated commits"
        index="auto_commit_interval"
        :disabled="!configuration[configuration.target].auto_commit"
        :options="auto_commit_interval_options"
      />
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
    <v-card
      color="surface"
      title="Interface Options"
      subtitle="Interface display and interaction options"
    >
      <theme-button />
      <boolean-input
        label="Dark Mode"
        detail="Use a dark color scheme to reduce brightness level of the interface"
        index="dark_mode"
      />
      <boolean-input
        label="Format Explorer Titles"
        detail="Display file and directory titles as formatted, with dots replaced with spaces and each word capitalized"
        index="format_explorer_titles"
      />
      <boolean-input
        label="Format Interaction Titles"
        detail="Display action and template titles as formatted, with dots replaced with spaces and each word capitalized"
        index="format_interaction_titles"
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
      <v-divider class="my-2" />
      <select-button-input
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
        label="Explorer Resize Control Width"
        detail="Specify the width of the control bar that resizes file explorer and viewport"
        index="explorer_resize_width"
      />
      <v-divider class="my-2" />
      <number-input
        label="Search Opacity"
        detail="Specify the opacity/transparency of the search result interface"
        index="search_opacity"
        suffix="%"
        :slider="[ 0, 100, 5 ]"
      />
      <number-input
        label="Search Height"
        detail="Specify the height of the search result interface"
        index="search_height"
      />
      <number-input
        label="Search Resize Control Height"
        detail="Specify the height of the control bar that resizes search result interface"
        index="search_resize_height"
      />
      <v-divider class="my-2" />
      <select-menu-input
        label="Log Message Level"
        detail="What log messages should be logged and reported to the console"
        index="log_level"
        :options="log_level_options"
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

<script setup lang="ts">
import { computed } from 'vue'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import { fetch_repository_store } from '@/store/modules/repository'
import { fetch_system_store } from '@/store/modules/system'
import logo from './logo.png'
import CredentialSelector from '@/components/Settings/Credentials/CredentialSelector.vue'
import SignatureInput from '@/components/Settings/SignatureInput.vue'
import BooleanInput from './Settings/BooleanInput.vue'
import NumberInput from './Settings/NumberInput.vue'
import SelectMenuInput, { Option as SelectMenuOption } from './Settings/SelectMenuInput.vue'
import SelectButtonInput, { Option as SelectButtonOption } from './Settings/SelectButtonInput.vue'
import TextInput from './Settings/TextInput.vue'
import ThemeButton from './Settings/ThemeButton.vue'
import UtilityPage from './UtilityPage.vue'
import SeaGame from './SeaGame.vue'
import {
  VCard,
  VCardText,
  VCol,
  VDivider,
  VIcon,
  VRow,
  VTab,
  VTabs,
} from 'vuetify/components'

const configuration = fetch_configuration_store()
const repository = fetch_repository_store()
const system = fetch_system_store()

const locality_title = computed(() => {
  switch (configuration.target) {
    case 'global': {
      return 'Global Settings'
    }

    case 'local': {
      return 'Local Settings'
    }

    default: {
      return ''
    }
  }
})

const locality_subtitle = computed(() => {
  switch (configuration.target) {
    case 'global': {
      return 'Global configuration for all instances of Tome, that persist between different repositories.'
    }

    case 'local': {
      return 'Local configuration for this instance of Tome, specific to the current repository only.'
    }

    default: {
      return ''
    }
  }
})

const locality_color = computed(() => {
  switch (configuration.target) {
    case 'global': {
      return 'primary'
    }

    case 'local': {
      return 'secondary'
    }

    default: {
      return ''
    }
  }
})

const auto_commit_interval_options = [
  { value: 'quarter-hourly', label: 'Quarter Hourly' },
  { value: 'half-hourly', label: 'Half Hourly' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'quarter-daily', label: 'Quarter Daily' },
  { value: 'half-daily', label: 'Half Daily' },
  { value: 'daily', label: 'Daily' },
] as SelectMenuOption[]

const log_level_options = [
  { value: 'trace', label: 'Trace' },
  { value: 'debug', label: 'Debug' },
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Warn' },
  { value: 'error', label: 'Error' },
  { value: 'fatal', label: 'Fatal' },
] as SelectMenuOption[]

const explorer_position_options = [
  { value: 'left', icon: 'mdi-dock-left' },
  { value: 'right', icon: 'mdi-dock-right' },
] as SelectButtonOption[]

async function close () {
  await system.page({ settings: false })
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
