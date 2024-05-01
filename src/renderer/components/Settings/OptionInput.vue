<template>
  <setting-frame
    :label="label"
    :detail="detail"
  >
    <v-btn-toggle
      :model-value="value"
      mandatory
      @update:model-value="debounce_update"
    >
      <v-btn
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        density="compact"
      >
        <v-icon>{{ option.icon }}</v-icon>
      </v-btn>
    </v-btn-toggle>
  </setting-frame>
</template>

<script lang="ts">
import SettingFrame from './SettingFrame.vue'
import {
  VBtn,
  VBtnToggle,
  VIcon,
} from 'vuetify/components'

export interface Option {
  value: string
  icon: string
}

export default {
  components: {
    SettingFrame,
    VBtn,
    VBtnToggle,
    VIcon,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'
import { debounce } from 'lodash'

const store = fetchStore()

interface Properties {
  label: string
  detail: string
  index: string
  options: Option[]
}

const properties = withDefaults(defineProps<Properties>(), {
  label: '',
  detail: '',
  index: '',
  options: () => ([] as Option[]),
})

const value = computed<string>(() => store.state.configuration[properties.index])

async function update (value: string) {
  await store.dispatch('configuration/update', { [properties.index]: value })
}

const debounce_update = debounce(update, 100)

defineExpose({
  update,
})
</script>
