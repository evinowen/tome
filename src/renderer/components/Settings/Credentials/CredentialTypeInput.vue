<template>
  <select-button-input
    :label="label"
    :detail="detail"
    index="credential_type"
    :options="options"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SelectButtonInput, { Option } from '@/components/Settings/SelectButtonInput.vue'

const label = ref('Credential Type')
const detail = ref('Set credential type used for pushing commits to remote repositories')

const options = [
  { value: 'password', label: 'Password', icon: 'mdi-alphabetical' },
  { value: 'key', label: 'Key', icon: 'mdi-key-variant' },
] as Option[]
</script>
