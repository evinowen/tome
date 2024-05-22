<template>
  <utility-page
    right
    :title="repository.patches_reference"
    :subtitle="repository.patches_type"
    :layer="2"
    :open="system.patch"
    @close="close"
  >
    <div class="flex-grow-0">
      <div class="patch-message">
        {{ repository.patches_message }}
      </div>
    </div>

    <div class="flex-grow-1 mb-3">
      <div
        v-if="patches.length === 0"
        class="patches-empty"
      >
        No Content
      </div>
      <div
        v-for="(file, file_index) in patches"
        :key="file_index"
        :class="[ file_index ? 'mt-4' : '']"
      >
        <v-card
          dense
          class="patch-content"
        >
          <v-card-title class="pa-2">
            {{ file.name }}
          </v-card-title>
          <v-card-text class="pa-2">
            <div
              v-for="(line, line_index) in file.lines"
              :key="line_index"
              :class="['line', line_color(line.type)]"
            >
              <pre style="overflow: wrap">{{ line_prefix(line.type) }}{{ line.line }}</pre>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </utility-page>
</template>

<script lang="ts">
export enum RepositoryPatchLineType {
  CONTEXT = 32,
  ADDITION = 43,
  DELETION = 45,
  CONTEXT_EOFNL = 61,
  ADD_EOFNL = 62,
  DEL_EOFNL = 60,
  FILE_HDR = 70,
  HUNK_HDR = 72,
  BINARY = 66,
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'
import UtilityPage from '@/components/UtilityPage.vue'
import {
  VCard,
  VCardText,
  VCardTitle,
} from 'vuetify/components'

const store = fetchStore()

const system = computed(() => store.state.system)
const repository = computed(() => store.state.repository)
const patches = computed(() => store.state.repository.patches)

async function close () {
  await store.dispatch('system/patch', false)
}

function line_color (type) {
  switch (type) {
    case RepositoryPatchLineType.HUNK_HDR:
      return 'blue--text'
    case RepositoryPatchLineType.ADDITION:
      return 'green--text'
    case RepositoryPatchLineType.DELETION:
      return 'red--text'
    default:
      return ''
  }
}

function line_prefix (type) {
  switch (type) {
    case RepositoryPatchLineType.HUNK_HDR:
      return ''
    case RepositoryPatchLineType.ADDITION:
      return '+ '
    case RepositoryPatchLineType.DELETION:
      return '- '
    default:
      return '  '
  }
}

defineExpose({
  line_color,
  line_prefix,
  close,
})
</script>

<style scoped>
.line {
  width: 100%;
  overflow: wrap;
}

pre {
  display: inline-block;
}

.header-pre {
  display: inline-block;
  vertical-align: bottom;
  color: black;
  line-height: 30px;
  font-size: 0.7em;
  padding-right: 8px;
}

.patches-empty {
  padding: 20px;
  font-size: 1.3em;
  text-align: center;
  opacity: 0.4;
}

.patch-content {
  clear: both;
  color: rgb(var(--v-theme-on-background));
  background: rgb(var(--v-theme-background));
  font-size: 1.15em;
  font-family: var(--font-monospace), monospace !important;
  font-size: var(--font-monospace-size);
  margin-bottom: 6px;
}

.patch-content :deep(.blue--text) {
  color: rgb(var(--v-theme-info));
}

.patch-content :deep(.red--text) {
  color: rgb(var(--v-theme-error));
}

.patch-content :deep(.green--text) {
  color: rgb(var(--v-theme-success));
}

.patch-message {
  font-family: var(--font-monospace), monospace !important;
  font-size: var(--font-monospace-size);
  overflow: auto;
}
</style>
