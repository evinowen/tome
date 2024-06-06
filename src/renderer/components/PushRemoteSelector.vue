<template>
  <select-menu
    v-if="options.length > 0"
    ref="input"
    class="ma-2"
    label="Remote"
    :value="value"
    :options="options"
    @update="select"
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
import SelectMenu from '@/components/Input/SelectMenu.vue'
import { VBtn } from 'vuetify/components'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'

const system = fetch_system_store()
const repository_remotes = fetch_repository_remotes_store()

const value = computed(() => repository_remotes.active.name === '' ? undefined : repository_remotes.active.name)
const options = computed(() => repository_remotes.list.map((item) => ({
  value: item.name,
  label: item.name,
  detail: item.url,
})))

async function remotes () {
  await system.page({ remotes: true })
}

async function select (name) {
  await repository_remotes.select(name)
}

defineExpose({
  remotes,
  select,
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
