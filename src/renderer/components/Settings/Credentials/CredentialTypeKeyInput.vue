<template>
  <div>
    <keyfile-input
      label="private key"
      index="private_key"
    />
    <text-input
      label="passphrase"
      index="passphrase"
      obscureable
    />
    <keyfile-output
      label="public key"
      :value="configuration.public_key"
    />
  </div>
</template>

<script setup lang="ts">
import KeyfileInput from '@/components/Settings/KeyfileInput.vue'
import KeyfileOutput from '@/components/KeyfileOutput.vue'
import TextInput from '@/components/Settings/TextInput.vue'
import { fetch_configuration_store } from '@/store/modules/configuration'

const configuration = fetch_configuration_store()
</script>
