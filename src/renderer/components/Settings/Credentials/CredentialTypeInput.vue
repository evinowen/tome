<template>
  <select-button-input
    :label="label"
    :detail="detail"
    index="credentials.type"
    localizer="credentials"
    :options="options"
    :frame="false"
    :target="target"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SelectButtonInput, { Option } from '@/components/Settings/SelectButtonInput.vue'
import { SettingsTarget } from '@/store/modules/configuration'

interface Properties {
  target?: SettingsTarget
}

withDefaults(defineProps<Properties>(), {
  target: undefined,
})

const label = ref('Credential Type')
const detail = ref('Set credential type used for pushing commits to remote repositories')

const options = [
  { value: 'password', label: 'Password', icon: 'mdi-alphabetical' },
  { value: 'key', label: 'Key', icon: 'mdi-key-variant' },
] as Option[]
</script>
