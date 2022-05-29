<template>
  <v-card v-resize=resize style="position: relative">
    <v-card-title class="pa-2">
      {{ title }}
    </v-card-title>
    <div ref="datatable">
      <v-data-table
        dense
        fixed-header
        hide-default-footer
        :height="datatable.height || 24"
        style="table-layout: fixed"
        mobile-breakpoint="0"
        :headers="headers"
        :items="items"
        :sort-by="['file']"
        :items-per-page=items.length
        class="my-2"
        @click:row="$emit('click', $event)"
      >
        <template v-slot:item.type="{ item }">
          <v-btn tile icon x-small :color="file_color(item.type)">
            <v-icon small class="mr-1">{{ file_icon(item.type) }}</v-icon>
            {{ file_type(item.type) }}
          </v-btn>
        </template>

        <template v-slot:item.action="{ item }">
          <v-btn tile icon x-small @click.stop="$emit('input', item.path)">
            <v-icon>{{ icon }}</v-icon>
          </v-btn>

        </template>
      </v-data-table>
    </div>
  </v-card>
</template>

<style>
.v-data-table table {
  table-layout: fixed;
}

.v-data-table td {
  padding: 0 !important;
  font-size: 10px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-data-table td:first-child {
  padding: 0 6px !important;
}

.v-data-table th:last-child {
  padding: 0 !important;
}

.v-data-table .v-btn {
  width: 100% !important;
  height: 100% !important;
  text-align: left;
  justify-content: left;
  color: white;
}

.v-data-table td:last-child .v-btn{
  text-align: center;
  justify-content: center;
}

.v-data-table .v-btn .v-icon {
  font-size: 14px !important;
}
</style>

<script>
import { VDataTable, VCard, VCardTitle, VBtn, VIcon } from 'vuetify/lib'

class RepositoryFile {
  static Type = {
    NEW: 1,
    MODIFIED: 2,
    RENAMED: 3,
    DELETED: 4,
    UNKNOWN: 0
  }

  constructor (path, type) {
    this.path = path
    this.type = type || File.Type.UNKNOWN
  }
}

export default {
  components: { VDataTable, VCard, VCardTitle, VBtn, VIcon },
  props: {
    title: { type: String, default: 'List' },
    items: { type: Array, default: () => [] },
    icon: { type: String, default: '' },
    height: { type: Number, default: 0 }
  },
  data: () => ({
    datatable: {
      offset: 64,
      height: 0,
      min_height: 100
    },
    headers: [
      { text: 'File', value: 'path', width: 'auto' },
      { text: 'Type', value: 'type', width: '70px' },
      { text: '', value: 'action', width: '23px', sortable: false }
    ]
  }),
  methods: {
    resize: function () {
      const height = this.height - this.datatable.offset

      this.datatable.height = height > this.datatable.min_height ? height : this.datatable.min_height
    },
    file_type: function (type) {
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
    },
    file_color: function (type) {
      switch (type) {
        case RepositoryFile.Type.NEW:
        case RepositoryFile.Type.MODIFIED:
        case RepositoryFile.Type.RENAMED:
          return 'green'
        case RepositoryFile.Type.DELETED:
          return 'red'
      }

      return ''
    },
    file_icon: function (type) {
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
}
</script>
