<template>
  <v-text-field
    ref="input"
    density="compact"
    clearable
    :label="label"
    :model-value="value"
    :append-icon="obscureable ? (obscured ? 'mdi-eye-off' : 'mdi-eye') : undefined"
    :type="(obscureable && obscured) ? 'password' : 'text'"
    @click:append="obscured = !obscured"
    @update:model-value="update"
  />
</template>

<script lang="ts">
import {
  VTextField,
} from 'vuetify/components'

export default {
  components: {
    VTextField,
  }
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

const obscured = ref(true)

export interface Props {
  label: string,
  index: string,
  obscureable?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  index: '',
  obscureable: false
})

const value = computed<string>(() => store.state.configuration[props.index])

async function update (value: string) {
  await store.dispatch('configuration/update', { [props.index]: value })
}

defineExpose({
  update,
  obscured,
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
