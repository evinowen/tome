<template>
  <setting-frame
    index="credentials"
    :float="false"
    :frame="frame"
  >
    <credential-type-input
      :color="color"
      :target="target"
    />
    <credential-type-password-input
      v-if="configuration[target || configuration.target].credentials.type === CredentialType.Password"
      :target="target"
    />
    <credential-type-key-input
      v-if="configuration[target || configuration.target].credentials.type === CredentialType.Key"
      :target="target"
    />
  </setting-frame>
</template>

<script setup lang="ts">
import { fetch_configuration_store, CredentialType, SettingsTarget } from '@/store/modules/configuration'
import CredentialTypeInput from '@/components/Settings/Credentials/CredentialTypeInput.vue'
import CredentialTypePasswordInput from '@/components/Settings/Credentials/CredentialTypePasswordInput.vue'
import CredentialTypeKeyInput from '@/components/Settings/Credentials/CredentialTypeKeyInput.vue'
import SettingFrame from '@/components/Settings/SettingFrame.vue'

interface Properties {
  color?: string
  frame?: boolean
  target?: SettingsTarget
}

withDefaults(defineProps<Properties>(), {
  color: 'primary',
  frame: true,
  target: undefined,
})

const configuration = fetch_configuration_store()
</script>
