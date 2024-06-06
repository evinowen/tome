<template>
  <setting-frame
    index="themes"
  >
    <v-btn
      ref="input-button"
      block
      :disabled="disabled"
      @click="click"
    >
      Theme Editor
    </v-btn>
  </setting-frame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import SettingFrame from '@/components/Settings/SettingFrame.vue'
import {
  VBtn,
} from 'vuetify/components'

const configuration = fetch_configuration_store()
const system = fetch_system_store()

const local = computed(() => configuration.target === SettingsTarget.Local)
const disabled = computed(() => local.value && !configuration.localized.themes)

async function click () {
  await system.page({ theme_editor: true })
}

defineExpose({
  local,
  disabled,
  click,
})
</script>
