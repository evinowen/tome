<template>
  <setting-frame
    index="signature"
    :float="false"
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
          index="signature.name"
          localizer="signature"
          :target="target"
          :frame="false"
        />
      </v-col>
      <v-col
        class="xs"
        cols="12"
        sm="6"
      >
        <text-input
          label="e-mail"
          index="signature.email"
          localizer="signature"
          :target="target"
          :frame="false"
        />
      </v-col>
    </v-row>
  </setting-frame>
</template>

<script setup lang="ts">
import { SettingsTarget } from '@/store/modules/configuration'
import SettingFrame from '@/components/Settings/SettingFrame.vue'
import TextInput from '@/components/Settings/TextInput.vue'
import {
  VCol,
  VRow,
} from 'vuetify/components'

interface Properties {
  target?: SettingsTarget
}

withDefaults(defineProps<Properties>(), {
  target: undefined,
})

</script>
