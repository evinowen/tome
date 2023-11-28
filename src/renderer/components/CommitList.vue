<template>
  <v-data-table
    id="root"
    density="compact"
    fixed-header
    mobile-breakpoint="0"
    height="320"
    :headers="headers"
    :items="items"
    :sort-by="[{ key: 'file'}]"
    :items-per-page="items.length"
  >
    <template #item.path="{ item }">
      <v-btn
        rounded="0"
        variant="text"
        class="path-button"
        @click.stop="$emit('click', item.path)"
      >
        {{ item.path }}
      </v-btn>
    </template>

    <template #item.type="{ item }">
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
    </template>

    <template #item.action="{ item }">
      <v-btn
        class="action-button"
        rounded="0"
        icon
        @click.stop="$emit('input', item.path)"
      >
        <v-icon>{{ icon }}</v-icon>
      </v-btn>
    </template>

    <template #bottom></template>
  </v-data-table>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import {
  VBtn,
  VCard,
  VCardTitle,
  VDataTable,
  VIcon,
} from 'vuetify/components'
import { Resize } from 'vuetify/directives'

class RepositoryFile {
  static Type = {
    NEW: 1,
    MODIFIED: 2,
    RENAMED: 3,
    DELETED: 4,
    UNKNOWN: 0
  }
}

@Component({
  components: {
    VBtn,
    VCard,
    VCardTitle,
    VDataTable,
    VIcon,
  },
  directives: {
    Resize
  },
  emits: [
    'click',
    'input',
  ]
})
class CommitList extends Vue {
  @Prop({ default: 'List' })
  title!: string

  @Prop({ default: () => [] })
  items!: any[]

  @Prop({ default: '' })
  icon!: string

  @Prop({ default: 0 })
  height!: number

  datatable = {
    offset: 64,
    height: 0,
    min_height: 100
  }

  headers = [
    { title: 'File', value: 'path', width: 'auto' },
    { title: 'Type', value: 'type', width: '78px' },
    { title: '', value: 'action', width: '23px', sortable: false }
  ]

  resize () {
    const height = this.height - this.datatable.offset

    this.datatable.height = height > this.datatable.min_height ? height : this.datatable.min_height
  }

  file_type (type) {
    switch (type) {
      case RepositoryFile.Type.NEW:
        return 'New'
      case RepositoryFile.Type.MODIFIED:
        return 'Modified'
      case RepositoryFile.Type.RENAMED:
        return 'Renamed'
      case RepositoryFile.Type.DELETED:
        return 'Deleted'
    }

    return ''
  }

  file_color (type) {
    switch (type) {
      case RepositoryFile.Type.NEW:
      case RepositoryFile.Type.MODIFIED:
      case RepositoryFile.Type.RENAMED:
        return 'green'
      case RepositoryFile.Type.DELETED:
        return 'red'
    }

    return ''
  }

  file_icon (type) {
    switch (type) {
      case RepositoryFile.Type.NEW:
        return 'mdi-file-star'
      case RepositoryFile.Type.MODIFIED:
        return 'mdi-file-edit'
      case RepositoryFile.Type.RENAMED:
        return 'mdi-file-swap'
      case RepositoryFile.Type.DELETED:
        return 'mdi-file-remove'
    }

    return ''
  }
}

export default toNative(CommitList)
</script>

<style scoped>
#root {
  background: rgb(var(--v-theme-background));
}

#root :deep(table) {
  table-layout: fixed;
}

#root :deep(.v-table__wrapper) {
  overflow-y: scroll;
  overflow-x: none;
}

#root :deep(td),
#root :deep(th) {
  font-size: 10px;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.path-button,
.type-button,
.action-button {
  width: 100%;
  height: 100%;
  padding: 0;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
}
.path-button {
  padding-left: 4px;
  text-transform: none;
}

.path-button,
.type-button {
  text-align: left;
  justify-content: left;
  font-size: 8px;
}

.type-button :deep(.v-icon) {
  font-size: 12px;
}

.action-button {
  text-align: center;
  justify-content: center;
}

.action-button :deep(.v-icon) {
  font-size: 14px;
}
</style>
