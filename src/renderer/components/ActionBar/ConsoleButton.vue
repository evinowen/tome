<template>
  <v-btn
    ref="button"
    rounded="0"
    size="small"
    variant="flat"
    class="console-button"
    :color="status === 'error' ? 'error' : ''"
    @click.stop="click"
  >
    <v-icon size="small">
      {{ status === 'error' ? 'mdi-exclamation-thick' : 'mdi-chevron-right' }}
    </v-icon>&nbsp;{{ message }}
  </v-btn>
</template>

<script lang="ts">
import {
  VBtn,
  VIcon,
} from 'vuetify/components'

export default {
  components: {
    VBtn,
    VIcon,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

export interface Properties {
  status?: string
  message?: string
}

withDefaults(defineProps<Properties>(), {
  status: '',
  message: '',
})

const open = computed(() => {
  return store.state.system.console
})

async function click () {
  await store.dispatch('system/console', !open.value)
}

defineExpose({
  open,
  click,
})
</script>

<style scoped>
.console-button {
  padding: 0px;
  height: 100%;
  min-height: 0;
  min-width: 0;
  justify-content: left;
  flex-grow: 1;
  flex-shrink: 1;
  font-size: 0.8em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.console-button span {
  width: 100%;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  padding: 0 4px !important;
}
</style>
