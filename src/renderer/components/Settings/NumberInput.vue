<template>
  <div class="d-flex key-border align-center">
    <div class="flex-shrink-0 pa-1">
      <v-text-field
        density="compact"
        suffix="px"
        style="width: 120px"
        :model-value="value"
        @update:model-value="debounce_update"
      />
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
  VTextField,
} from 'vuetify/components'

export default {
  components: {
    VTextField,
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

const value = computed<number>(() => store.state.configuration[properties.index])

async function update (value: string) {
  await store.dispatch('configuration/update', { [properties.index]: Number(value) || 120 })
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
