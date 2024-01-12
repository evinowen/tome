<template>
  <v-switch
    :label="label"
    :model-value="value"
    @update:model-value="update"
  />
</template>

<script lang="ts">
import {
  VSwitch,
} from 'vuetify/components'

export default {
  components: {
    VSwitch,
  }
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

export interface Props {
  label: string,
  index: string,
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  index: '',
})

const value = computed<boolean>(() => store.state.configuration[props.index])

async function update (value: boolean) {
  await store.dispatch('configuration/update', { [props.index]: value })
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
