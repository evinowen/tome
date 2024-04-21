<template>
  <v-switch
    :model-value="value"
    @update:model-value="update"
    hide-details
    class="ml-4"
  >
    <template #label>
      <div class="d-flex key-border align-center">
        <div class="flex-shrink-0 pa-1">
          <strong>{{ label }}</strong>
        </div>
        <div class="flex-grow-1 pa-1">
          {{ detail }}
        </div>
      </div>
    </template>
  </v-switch>
</template>

<script lang="ts">
import {
  VSwitch,
} from 'vuetify/components'

export default {
  components: {
    VSwitch,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'

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
