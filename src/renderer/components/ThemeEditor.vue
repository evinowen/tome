<template>
  <utility-page
    right
    title="Theme Editor"
    :layer="11"
    :open="system.theme_editor"
    @close="close"
  >
    <theme-preview />
    <v-row dense>
      <v-col>
        <v-container>
          <v-row dense>
            <v-col>
              <theme-color-picker
                :theme="theme"
                color="background"
              />
            </v-col>
            <v-col>
              <theme-color-picker
                :theme="theme"
                color="surface"
              />
            </v-col>
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
    ThemeColorPicker,
    ThemePreview,
    UtilityPage,
    VCol,
    VContainer,
    VRow,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

const configuration = computed(() => store.state.configuration)
const system = computed(() => store.state.system)

const theme = computed(() => configuration.value.dark_mode ? 'dark' : 'light')

async function close () {
  await store.dispatch('system/theme_editor', false)
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
