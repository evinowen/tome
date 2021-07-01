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
      >
        <template v-slot:item.type="{ item }">
          <v-btn tile icon x-small :color="item.color">
            <v-icon small class="mr-1">{{ item.icon }}</v-icon>
            {{ item.type }}
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
export default {
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
    }
  }
}
</script>
