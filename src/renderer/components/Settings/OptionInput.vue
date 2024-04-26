<template>
  <div class="d-flex key-border align-center">
    <div class="flex-shrink-0 pa-1">
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
    </div>
    <div class="flex-shrink-0 pa-1">
      <strong>{{ label }}</strong>
    </div>
    <div class="flex-grow-1 pa-1">
      {{ detail }}
    </div>
  </div>
</template>

<script lang="ts">
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

<style scoped>
.tome-badge {
  display: flex;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
  margin: auto;
  width: 200px;
  padding: 6px;
  text-align: center;
}

.tome-badge-logo {
  flex-grow: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tome-badge-data {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
</style>
