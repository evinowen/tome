<template>
  <v-menu
    :model-value="show"
    @update:model-value="show = !show"
  >
    <template #activator="{ props }">
      <v-btn
        v-if="repository.path"
        ref="close-button"
        action-bar-bookshelf
        rounded="0"
        size="small"
        color="accent"
        variant="flat"
        class="library-button"
        :disabled="disabled"
        @click.stop="close"
      >
        <v-icon
          size="small"
          style="transform: rotate(180deg);"
        >
          mdi-exit-to-app
        </v-icon>
      </v-btn>
      <v-btn
        v-else
        ref="bookshelf-button"
        action-bar-bookshelf
        rounded="0"
        size="small"
        color="accent"
        variant="flat"
        class="library-button"
        v-bind="props"
        :disabled="disabled"
      >
        <v-icon size="small">
          mdi-bookshelf
        </v-icon>
      </v-btn>
    </template>

    <v-list
      class="library-menu"
      density="compact"
    >
      <v-list-item
        v-for="(item, index) in library.history"
        :key="index"
        density="compact"
        prepend-icon="mdi-book"
        @click="open(item)"
      >
        <v-list-item-title>{{ item }}</v-list-item-title>
      </v-list-item>
      <v-divider />
      <v-list-item
        prepend-icon="mdi-folder-open"
        @click="select"
      >
        <v-list-item-title>Select ...</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import {
  VBtn,
  VDivider,
  VIcon,
  VList,
  VListItem,
  VListItemTitle,
  VMenu,
} from 'vuetify/components'

export default {
  components: {
    VBtn,
    VDivider,
    VIcon,
    VList,
    VListItem,
    VListItemTitle,
    VMenu,
  },
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { fetch_library_store } from '@/store/modules/library'
import { fetch_repository_store } from '@/store/modules/repository'

export interface Properties {
  disabled?: boolean
}

withDefaults(defineProps<Properties>(), {
  disabled: false,
})

const library = fetch_library_store()
const repository = fetch_repository_store()

const show = ref(false)

async function select () {
  await library.select()
}

async function open (item) {
  await library.open(item)
}

async function close () {
  await library.close()
}

defineExpose({
  close,
  open,
  select,
  show,
})
</script>

<style scoped>
.library-button {
  padding: 0px;
  height: 100%;
  width: 30px;
  min-height: 0;
  min-width: 30px;
}

.library-menu :deep(.v-list-item) {
  padding: 0 4px;
  min-height: 20px;
  min-width: 120px;
}

.library-menu :deep(.v-list-item--one-line) {
  padding-inline-start: 6px;
  padding-inline-end: 6px;
}

.library-menu :deep(.v-list-item__spacer) {
  width: 12px;
}

.library-menu :deep(.v-list-item-title) {
  font-size: 0.8em;
}
</style>
