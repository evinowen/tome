<template>
  <v-menu
    location="top"
    :model-value="value"
    transition="slide-y-reverse-transition"
    content-class="menu"
    :close-on-content-click="false"
    width="50%"
    @update:model-value="value = !value"
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
          variant="text"
          :disabled="!license"
          @click="open(license)"
        >
          License
        </v-btn>
      </v-card-actions>
      <v-divider />
      <v-card-actions>
        <v-btn
          variant="text"
          :disabled="!readme"
          @click="open(readme)"
        >
          Read Me
        </v-btn>
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="!authors"
          @click="open(authors)"
        >
          Authors
        </v-btn>
        <v-btn
          variant="text"
          :disabled="!contributors"
          @click="open(contributors)"
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
  }
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { fetchStore } from '@/store'

const store = fetchStore()

export interface Props {
  name: string,
  path: string,
  readme: string,
  authors: string,
  contributors: string,
  license: string,
  disabled: boolean,
}

withDefaults(defineProps<Props>(), {
  name: '',
  path: '',
  readme: '',
  authors: '',
  contributors: '',
  license: '',
  disabled: false,
})

const value = ref(false)

async function open (path) {
  value.value = false
  await store.dispatch('files/select', { path })
}
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
