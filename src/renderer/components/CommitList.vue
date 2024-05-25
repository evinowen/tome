<template>
  <div class="d-flex flex-column">
    <div class="flex-grow-0 d-flex pt-3 table-headers">
      <div class="column-file">
        File
      </div>
      <div class="column-type">
        Type
      </div>
      <div class="column-action" />
    </div>
    <div
      class="flex-grow-1 flex-shrink-1 table-body"
      :style="{ 'min-height': `${height}px`, 'height': 0 }"
    >
      <div
        v-for="item in items"
        :key="item.path"
        class="table-row"
      >
        <div class="d-flex table-row-content">
          <div class="column-file">
            <v-btn
              rounded="0"
              variant="text"
              class="path-button"
              @click.stop="$emit('click', item.path)"
            >
              {{ item.path }}
            </v-btn>
          </div>
          <div class="column-type">
            <v-btn
              rounded="0"
              variant="text"
              class="type-button"
              :color="file_color(item.type)"
            >
              <v-icon
                size="small"
                class="mr-1"
              >
                {{ file_icon(item.type) }}
              </v-icon>
              {{ file_type(item.type) }}
            </v-btn>
          </div>
          <div class="column-action">
            <v-btn
              class="action-button"
              rounded="0"
              variant="text"
              icon
              @click.stop="$emit('input', item.path)"
            >
              <v-icon>{{ icon }}</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  VBtn,
  VIcon,
} from 'vuetify/components'
import { Resize } from 'vuetify/directives'

export default {
  components: {
    VBtn,
    VIcon,
  },
  directives: {
    Resize,
  },
  emits: [
    'click',
    'input',
  ],
}

export enum RepositoryFileType {
  New = 'new',
  Modified = 'modified',
  Renamed = 'renamed',
  Deleted = 'deleted',
  Unknown = 'unknown',
}
</script>

<script setup lang="ts">
export interface Properties {
  title?: string
  items?: any[]
  icon?: string
  height?: number
}

withDefaults(defineProps<Properties>(), {
  title: 'List',
  items: () => [],
  icon: '',
  height: 320,
})

function file_type (type) {
  switch (type) {
    case RepositoryFileType.New:
      return 'New'
    case RepositoryFileType.Modified:
      return 'Modified'
    case RepositoryFileType.Renamed:
      return 'Renamed'
    case RepositoryFileType.Deleted:
      return 'Deleted'
  }

  return ''
}

function file_color (type) {
  switch (type) {
    case RepositoryFileType.New:
    case RepositoryFileType.Modified:
    case RepositoryFileType.Renamed:
      return 'green'
    case RepositoryFileType.Deleted:
      return 'red'
  }

  return ''
}

function file_icon (type) {
  switch (type) {
    case RepositoryFileType.New:
      return 'mdi-file-star'
    case RepositoryFileType.Modified:
      return 'mdi-file-edit'
    case RepositoryFileType.Renamed:
      return 'mdi-file-swap'
    case RepositoryFileType.Deleted:
      return 'mdi-file-remove'
  }

  return ''
}

defineExpose({
  file_color,
  file_icon,
  file_type,
})
</script>

<style scoped>
.root {
  background: rgb(var(--v-theme-background));
}

.table-headers {
  overflow-y: scroll;
}

.table-headers::-webkit-scrollbar,
.table-headers::-webkit-scrollbar-corner,
.table-headers::-webkit-scrollbar-track,
.table-headers::-webkit-scrollbar-thumb {
  background: transparent;
}

.table-headers .column-file {
  padding: 0 4px;
}

.table-headers .column-type {
  padding: 0 8px;
}

.column-file {
  flex-grow: 12;
  flex-shrink: 20;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 60%;
}

.column-type {
  flex-grow: 6;
  flex-shrink: 0;
  overflow: hidden;
  width: 30%;
}

.column-action {
  flex-grow: 2;
  flex-shrink: 0;
  width: 2.5em;
}

.table-body {
  outline: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  background: rgb(var(--v-theme-background));
  overflow-x: hidden;
  overflow-y: scroll;
}

.table-row {
  background: rgb(var(--v-theme-surface));
  box-shadow: 0 -1px 0 rgba(var(--v-theme-on-surface), 0.05) inset;
}

.table-row-content {
  transition: all 0.15s ease-in-out;
}
.table-row-content:hover {
  background: rgba(var(--v-theme-on-surface), 0.05);
}

.path-button,
.type-button,
.action-button {
  width: 100%;
  height: 100%;
  padding: 8px;
  color: rgb(var(--v-theme-on-surface));
}

.path-button {
  padding-left: 4px;
  text-transform: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.path-button,
.type-button {
  text-align: left;
  justify-content: left;
  font-size: 0.65em;
}

.type-button :deep(.v-icon) {
  font-size: 2em;
}

.action-button {
  font-size: 1em;
  text-align: center;
  justify-content: center;
}

.action-button :deep(.v-icon) {
  font-size: 1.3em;
}
</style>
