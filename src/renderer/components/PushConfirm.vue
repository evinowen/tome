<template>
  <v-dialog :value="value" persistent max-width="600px" @input="$emit('input', $event)">
    <template #activator="{ on }">
      <v-btn class="mr-4" :disabled="disabled" v-on="on">
        <v-icon class="mr-2">
          mdi-upload-multiple
        </v-icon>
        Push
      </v-btn>
    </template>
    <v-card>
      <v-list-item>
        <v-list-item-avatar color="warning">
          <v-icon>mdi-upload-multiple</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="headline">
            Push
          </v-list-item-title>
          <v-list-item-subtitle>Push completed commits up to remote repository</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-container fluid class="pa-0 ma-0" style="min-height: 120px">
        <v-data-table
          :headers="headers"
          :items="history"
          :items-per-page="history.length"
          hide-default-footer
          dense disable-sort class="my-0 commit-history"
        >
          <template #item.oid="{ item }">
            <v-btn tile icon x-small color="warning">
              {{ item.oid.substring(0, 7) }}
            </v-btn>
          </template>
        </v-data-table>
      </v-container>
      <v-card-actions>
        <v-btn
          ref="push_confirm"
          color="warning"
          text :disabled="waiting"
          @click="$emit('push')"
        >
          <v-progress-circular
            :indeterminate="waiting"
            :size="12"
            :width="2"
            color="warning"
            class="mr-2"
          />
          Proceed
        </v-btn>
        <v-spacer />
        <v-btn color="darken-1" text :disabled="waiting" @click="$emit('input', false)">
          <v-icon class="mr-2">
            mdi-exit-to-app
          </v-icon>
          Back
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  VContainer,
  VDialog,
  VBtn,
  VSpacer,
  VProgressCircular,
  VIcon,
  VCard,
  VCardActions,
  VDataTable,
  VListItem,
  VListItemTitle,
  VListItemSubtitle,
  VListItemAvatar,
  VListItemContent
} from 'vuetify/lib'

export default Vue.extend({
  components: {
    VContainer,
    VDialog,
    VBtn,
    VSpacer,
    VProgressCircular,
    VIcon,
    VCard,
    VCardActions,
    VDataTable,
    VListItem,
    VListItemTitle,
    VListItemSubtitle,
    VListItemAvatar,
    VListItemContent
  },
  props: {
    value: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    waiting: { type: Boolean, default: false },
    history: { type: Array, default: () => [] }
  },
  data: () => ({
    headers: [
      { text: '', value: 'oid', width: '60px' },
      { text: '', value: 'message', width: '' }
    ]
  })
})
</script>

<style scoped>
.v-data-table.commit-history {
  border-radius: 0
}

.v-data-table.commit-history .v-btn {
  width: 100% !important;
  height: 100% !important;
  text-align: left;
  justify-content: left;
}

.v-data-table.commit-history th {
  height: 1px;
}

.v-data-table.commit-history td {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 8px !important;
}

.v-data-table.commit-history td:first-child {
  padding: 0px !important;
}

.v-data-table.commit-history td:first-child .v-btn {
  text-align: center;
  justify-content: center;
}

.v-data-table.commit-history .v-btn .v-icon {
  font-size: 14px !important;
}
</style>
