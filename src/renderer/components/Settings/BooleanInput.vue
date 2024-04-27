<template>
  <setting-frame
    :label="label"
    :detail="detail"
  >
    <v-switch
      class="mx-4"
      hide-details
      :model-value="value"
      @update:model-value="debounce_update"
    />
  </setting-frame>
</template>

<script lang="ts">
import SettingFrame from './SettingFrame.vue'
import {
  VSwitch,
} from 'vuetify/components'

export default {
  components: {
    SettingFrame,
    VSwitch,
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
}

const properties = withDefaults(defineProps<Properties>(), {
  label: '',
  detail: '',
  index: '',
})

const value = computed<boolean>(() => store.state.configuration[properties.index])

async function update (value: boolean) {
  await store.dispatch('configuration/update', { [properties.index]: value })
}

const debounce_update = debounce(update, 100)

defineExpose({
  update,
})
</script>
