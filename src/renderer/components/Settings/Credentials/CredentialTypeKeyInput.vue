<template>
  <div>
    <keyfile-input
      label="private key"
      index="credentials.key"
      localizer="credentials"
      :target="target"
    />
    <secret-input
      label="passphrase"
      index="credentials.passphrase"
      prompt_index="credentials.prompt_passphrase"
      localizer="credentials"
      :frame="false"
      :target="target"
    />
    <keyfile-output
      label="public key"
      :error="public_key[target || configuration.target].error"
      :value="public_key[target || configuration.target].data"
    />
  </div>
</template>

<script setup lang="ts">
import { fetch_configuration_store, SettingsTarget } from '@/store/modules/configuration'
import KeyfileInput from '@/components/Settings/KeyfileInput.vue'
import KeyfileOutput from '@/components/KeyfileOutput.vue'
import SecretInput from '@/components/Settings/SecretInput.vue'
import PublicKey from '@/composables/PublicKey'

const configuration = fetch_configuration_store()

const public_key = PublicKey()

interface Properties {
  disabled?: boolean
  target?: SettingsTarget
}

withDefaults(defineProps<Properties>(), {
  disabled: false,
  target: undefined,
})
</script>
