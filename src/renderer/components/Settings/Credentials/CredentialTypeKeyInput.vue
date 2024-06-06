<template>
  <div>
    <keyfile-input
      label="private key"
      index="credentials.private_key"
      localizer="credentials"
      :target="target"
    />
    <text-input
      label="passphrase"
      index="credentials.passphrase"
      localizer="credentials"
      :frame="false"
      :target="target"
      obscureable
    />
    <keyfile-output
      label="public key"
      :value="configuration[target || configuration.target].credentials.public_key"
    />
  </div>
</template>

<script setup lang="ts">
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import KeyfileInput from '@/components/Settings/KeyfileInput.vue'
import KeyfileOutput from '@/components/KeyfileOutput.vue'
import TextInput from '@/components/Settings/TextInput.vue'

const configuration = fetch_configuration_store()

interface Properties {
  disabled?: boolean
  target?: SettingsTarget
}

withDefaults(defineProps<Properties>(), {
  disabled: false,
  target: undefined,
})
</script>
