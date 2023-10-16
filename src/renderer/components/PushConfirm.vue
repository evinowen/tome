<template>
  <v-dialog
    :model-value="value"
    persistent
    max-width="600px"
    @update:model-value="$emit('input', $event)"
  >
    <template #activator="{ on }">
      <v-btn
        class="mr-4"
        :disabled="disabled"
        v-on="on"
      >
        <v-icon class="mr-2">
          mdi-upload-multiple
        </v-icon>
        Push
      </v-btn>
    </template>
    <v-card>
      <v-list-item>
        <template #prepend>
          <v-avatar color="warning">
            <v-icon>mdi-upload-multiple</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title class="text-h5">
          Push
        </v-list-item-title>
        <v-list-item-subtitle>Push completed commits up to remote repository</v-list-item-subtitle>
      </v-list-item>
      <v-container
        fluid
        class="pa-0 ma-0"
        style="min-height: 120px"
      >
        <!-- <v-data-table
          :headers="headers"
          :items="history"
          :items-per-page="history.length"
          hide-default-footer
          dense
          disable-sort
          class="my-0 commit-history"
        >
          <template #item.oid="{ item }">
            <v-btn
              rounded="0"
              icon
              x-small
              color="warning"
            >
              {{ item.oid.substring(0, 7) }}
            </v-btn>
          </template>
        </v-data-table> -->
      </v-container>
      <v-card-actions>
        <v-btn
          ref="push_confirm"
          color="warning"
          variant="text"
          :disabled="waiting"
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
        <v-btn
          color="darken-1"
          variant="text"
          :disabled="waiting"
          @click="$emit('input', false)"
        >
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
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import {
  VAvatar,
  VContainer,
  VDialog,
  VBtn,
  VSpacer,
  VProgressCircular,
  VIcon,
  VCard,
  VCardActions,
  // VDataTable,
  VListItem,
  VListItemTitle,
  VListItemSubtitle
} from 'vuetify/components'

@Component({
  components: {
    VAvatar,
    VContainer,
    VDialog,
    VBtn,
    VSpacer,
    VProgressCircular,
    VIcon,
    VCard,
    VCardActions,
    // VDataTable,
    VListItem,
    VListItemTitle,
    VListItemSubtitle
  }
})
class PushConfirm extends Vue {
  @Prop({ default: false })
  value: boolean

  @Prop({ default: false })
  disabled: boolean

  @Prop({ default: false })
  waiting: boolean

  @Prop({ default: () => [] })
  history: any[]

  headers = [
    { text: '', value: 'oid', width: '60px' },
    { text: '', value: 'message', width: '' }
  ]
}

export default toNative(PushConfirm)
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
