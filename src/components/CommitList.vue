<template>
  <v-card>
    <v-card-title class="pa-2">
      {{ title }}
    </v-card-title>
    <v-data-table dense
      :headers="headers"
      :items="items"
      :sort-by="['file']"
      :hide-default-footer="true"
      :items-per-page="items.length"
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
  </v-card>
</template>

<style>
.v-data-table td {
  padding: 0 !important;
  font-size: 10px !important;
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
    icon: { type: String, default: '' }
  },
  data: () => ({
    headers: [
      { text: 'File', value: 'path', width: '' },
      { text: 'Type', value: 'type', width: '70px' },
      { text: '', value: 'action', width: '23px', sortable: false }
    ]
  })
}
</script>
