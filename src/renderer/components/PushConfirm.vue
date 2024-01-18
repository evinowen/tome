<template>
  <v-dialog
    :model-value="value"
    persistent
    max-width="600px"
    @update:model-value="$emit('input', $event)"
  >
    <template #activator="{ props }">
      <v-btn
        class="mr-4"
        :disabled="disabled"
        v-bind="props"
      >
        <v-icon class="mr-2">
          mdi-upload-multiple
        </v-icon>
        Push
      </v-btn>
    </template>
    <v-card>
      <v-list-item class="my-2">
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
        <v-data-table
          :headers="headers"
          :items="history"
          :items-per-page="history.length"
          hide-default-footer
          density="compact"
          disable-sort
          class="my-0 commit-history"
        >
          <template #headers />

          <template #item.oid="{ item }">
            <v-btn
              rounded="0"
              variant="text"
              color="warning"
              @click.stop="$emit('commit', item)"
            >
              {{ item.oid.substring(0, 7) }}
            </v-btn>
          </template>

          <template #bottom />
        </v-data-table>
      </v-container>
      <v-card-actions>
        <v-btn
          ref="push-button"
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
          ref="return-button"
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
import {
  VAvatar,
  VBtn,
  VCard,
  VCardActions,
  VContainer,
  VDataTable,
  VDialog,
  VIcon,
  VListItem,
  VListItemSubtitle,
  VListItemTitle,
  VProgressCircular,
  VSpacer,
} from 'vuetify/components'

export default {
  components: {
    VAvatar,
    VBtn,
    VCard,
    VCardActions,
    VContainer,
    VDataTable,
    VDialog,
    VIcon,
    VListItem,
    VListItemSubtitle,
    VListItemTitle,
    VProgressCircular,
    VSpacer,
  },
  emits: [
    'commit',
    'input',
    'push',
  ],
}
</script>

<script setup lang="ts">
export interface Properties {
  value?: boolean
  disabled?: boolean
  waiting?: boolean
  history?: any[]
}

withDefaults(defineProps<Properties>(), {
  value: false,
  disabled: false,
  waiting: false,
  history: () => [],
})

const headers = [
  { title: '', value: 'oid', width: '60px' },
  { title: '', value: 'message', width: '' },
]
</script>

<style scoped>
.v-data-table.commit-history :deep(td) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 8px !important;
}

.v-data-table.commit-history :deep(td:first-child) {
  padding: 0px !important;
}
</style>
