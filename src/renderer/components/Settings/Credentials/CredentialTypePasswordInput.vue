<template>
  <div>
    <text-input
      label="username"
      index="credentials.username"
      localizer="credentials"
      :frame="false"
      :target="target"
    />
    <text-input
      label="password"
      index="credentials.password"
      localizer="credentials"
      :frame="false"
      :target="target"
      obscureable
    />
  </div>
</template>

<script setup lang="ts">
import TextInput from '@/components/Settings/TextInput.vue'
import { SettingsTarget } from '@/store/modules/configuration'

interface Properties {
  target?: SettingsTarget
}

withDefaults(defineProps<Properties>(), {
  target: undefined,
})
</script>
