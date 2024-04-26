<template>
  <div class="d-flex key-border">
    <div class="flex-grow-1 pa-1">
      <v-text-field
        ref="input-field"
        density="compact"
        variant="solo"
        hide-details
        clearable
        :label="label"
        :model-value="value"
        :type="(obscureable && obscured) ? 'password' : 'text'"
        @update:model-value="update"
      />
    </div>
    <div
      v-if="obscureable"
      class="flex-grow-0 pa-1"
    >
      <v-btn
        ref="obscure-button"
        rounded="0"
        icon
        :disabled="value === ''"
        style="height: 100%;"
        @click="obscured = !obscured"
      >
        <v-icon size="small">
          {{ obscured ? 'mdi-eye-off' : 'mdi-eye' }}
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import {
  VBtn,
  VIcon,
  VTextField,
} from 'vuetify/components'

export default {
  components: {
    VBtn,
    VIcon,
    VTextField,
  },
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

const obscured = ref(true)

interface Properties {
  label: string
  index: string
  obscureable?: boolean
}

const properties = withDefaults(defineProps<Properties>(), {
  label: '',
  index: '',
  obscureable: false,
})

const value = computed<string>(() => store.state.configuration[properties.index])

async function update (value: string) {
  await store.dispatch('configuration/update', { [properties.index]: value })
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
