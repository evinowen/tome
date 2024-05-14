<template>
  <v-menu
    location="top"
    :model-value="open"
    transition="slide-y-reverse-transition"
    content-class="menu"
    :close-on-content-click="false"
    width="50%"
    @update:model-value="open = !open"
  >
    <template #activator="{ props }">
      <v-btn
        rounded="0"
        size="small"
        class="button pa-0 px-2"
        v-bind="props"
        :disabled="disabled"
      >
        {{ name }}
      </v-btn>
    </template>

    <v-card rounded="0">
      <v-card-title>{{ name }}</v-card-title>
      <v-card-subtitle>{{ path }}</v-card-subtitle>
      <v-card-actions>
        <v-btn
          ref="license-button"
          variant="text"
          :disabled="!license"
          @click="select(license)"
        >
          License
        </v-btn>
      </v-card-actions>
      <v-divider />
      <v-card-actions>
        <v-btn
          ref="readme-button"
          variant="text"
          :disabled="!readme"
          @click="select(readme)"
        >
          Read Me
        </v-btn>
        <v-spacer />
        <v-btn
          ref="authors-button"
          variant="text"
          :disabled="!authors"
          @click="select(authors)"
        >
          Authors
        </v-btn>
        <v-btn
          ref="contributors-button"
          variant="text"
          :disabled="!contributors"
          @click="select(contributors)"
        >
          Contributors
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import {
  VBtn,
  VCard,
  VCardActions,
  VCardSubtitle,
  VCardTitle,
  VDivider,
  VMenu,
  VSpacer,
} from 'vuetify/components'

export default {
  components: {
    VBtn,
    VCard,
    VCardActions,
    VCardSubtitle,
    VCardTitle,
    VDivider,
    VMenu,
    VSpacer,
  },
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { fetchStore } from '@/store'

export interface Properties {
  name?: string
  path?: string
  readme?: string
  authors?: string
  contributors?: string
  license?: string
  disabled?: boolean
}

withDefaults(defineProps<Properties>(), {
  name: '',
  path: '',
  readme: '',
  authors: '',
  contributors: '',
  license: '',
  disabled: false,
})

const store = fetchStore()
const open = ref(false)

async function select (path) {
  open.value = false
  await store.dispatch('files/select', { path })
}

defineExpose({
  open,
  select,
})
</script>

<style scoped>
.button {
  height: 18px !important;
}

.menu {
  left: 2px !important;
  top: auto !important;
  bottom: 21px !important;
}
</style>
