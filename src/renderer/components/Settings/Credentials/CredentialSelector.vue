<template>
  <div>
    <credential-type-input />
    <credential-type-password-input v-if="store.state.configuration.credential_type === 'password'" />
    <credential-type-key-input v-if="store.state.configuration.credential_type === 'key'" />
  </div>
</template>

<script setup lang="ts">
import { fetchStore } from '@/store'
import CredentialTypeInput from '@/components/Settings/Credentials/CredentialTypeInput.vue'
import CredentialTypePasswordInput from '@/components/Settings/Credentials/CredentialTypePasswordInput.vue'
import CredentialTypeKeyInput from '@/components/Settings/Credentials/CredentialTypeKeyInput.vue'

const store = fetchStore()
</script>
