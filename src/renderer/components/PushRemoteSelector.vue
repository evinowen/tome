<template>
  <select-menu
    v-if="options.length > 0"
    ref="input"
    class="ma-2"
    label="Remote"
    :value="value"
    :options="options"
    @update="update"
  />
  <div
    v-else
    class="remotes-empty pa-4"
  >
    <div class="mb-2">
      <div class="text-h6">
        No Remotes are defined for this Repository
      </div>
      <div>To push commits a destination remote will need to be defined.</div>
    </div>
    <v-btn
      ref="remote-button"
      class="remote-create"
      @click="remotes"
    >
      Add a Remote
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SelectMenu from '@/components/SelectMenu.vue'
import { VBtn } from 'vuetify/components'
import { fetchStore } from '@/store'
import { RepositoryRemote } from '@/store/modules/repository'

export interface Properties {
  value?: string
  items?: RepositoryRemote[]
}

const properties = withDefaults(defineProps<Properties>(), {
  value: '',
  items: () => [],
})

const store = fetchStore()
const options = computed(() => properties.items.map((item) => ({
  value: item.name,
  label: item.name,
  detail: item.url,
})))

const emit = defineEmits([
  'update',
])

async function update (remote) {
  emit('update', remote)
}

async function remotes () {
  await store.dispatch('system/remotes', true)
}

defineExpose({
  update,
})
</script>

<style scoped>
.remotes-empty {
  display: flex;
  flex-direction: column;
  text-align: center;
}

.remote-create {
  margin: auto;
  max-width: 180px;
}
</style>
