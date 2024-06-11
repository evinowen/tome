<template>
  <v-card
    class="text-center"
    :loading="loading"
    :disabled="disabled"
  >
    <v-card-text>
      <div class="text-h6 text--primary">
        <v-icon
          v-if="create"
          color="warning"
        >
          mdi-new-box
        </v-icon>
        <span v-else>{{ reference || '&mdash;' }}</span>
      </div>
      <hr>
      <div class="text-h4 text--primary">
        {{ name || '&mdash;' }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fetch_repository_remotes_store } from '@/store/modules/repository/remotes'
import { fetch_repository_branches_store } from '@/store/modules/repository/branches'
import {
  VCard,
  VCardText,
  VIcon,
} from 'vuetify/components'

export interface Properties {
  local?: boolean
  remote?: boolean
}

const properties = withDefaults(defineProps<Properties>(), {
  local: false,
  remote: false,
})

const repository_branches = fetch_repository_branches_store()
const repository_remotes = fetch_repository_remotes_store()

const loading = computed(() => {
  if (properties.remote) {
    return repository_remotes.process.select
  }

  return false
})

const reference = computed(() => {
  if (properties.remote) {
    if (loading.value || repository_remotes.error) {
      return ''
    }

    if (repository_remotes.selected) {
      return repository_remotes.active.branch?.name
    }
  }

  return ''
})

const name = computed(() => {
  if (properties.local) {
    return repository_branches.active
  }

  if (properties.remote) {
    if (loading.value || repository_remotes.error) {
      return ''
    }

    if (repository_remotes.selected) {
      return repository_remotes.active.branch?.short || repository_branches.active
    }
  }

  return ''
})

const create = computed(() => {
  if (properties.remote) {
    if (loading.value || repository_remotes.error) {
      return ''
    }

    if (repository_remotes.selected) {
      return !repository_remotes.active.branch
    }
  }

  return ''
})

const disabled = computed(() => {
  if (properties.remote) {
    if (loading.value || repository_remotes.error) {
      return false
    }

    if (repository_remotes.selected) {
      return repository_remotes.active.branch?.name === ''
    }
  }

  return false
})

defineExpose({
  reference,
  name,
  loading,
  disabled,
})
</script>
