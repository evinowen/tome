<template>
  <text-input
    ref="input-field"
    :value="value"
    :label="label"
    :obscureable="obscureable"
    :placeholder="placeholder"
    @update="debounce_update"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { debounce } from 'lodash'
import { fetch_configuration_store } from '@/store/modules/configuration'
import TextInput from '@/components/Input/TextInput.vue'

const configuration = fetch_configuration_store()

interface Properties {
  label: string
  index: string
  obscureable?: boolean
  placeholder?: string
}

const properties = withDefaults(defineProps<Properties>(), {
  label: '',
  index: '',
  obscureable: false,
  placeholder: '',
})

const value = computed<string>(() => configuration[properties.index])

async function update (value: string) {
  await configuration.update({ [properties.index]: value })
}

const debounce_update = debounce(update, 500)

defineExpose({
  update,
})
</script>
