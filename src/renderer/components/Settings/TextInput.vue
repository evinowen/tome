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
import { fetchStore } from '@/store'
import TextInput from '@/components/Input/TextInput.vue'

const store = fetchStore()

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

const value = computed<string>(() => store.state.configuration[properties.index])

async function update (value: string) {
  await store.dispatch('configuration/update', { [properties.index]: value })
}

const debounce_update = debounce(update, 500)

defineExpose({
  update,
})
</script>
