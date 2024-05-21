<template>
  <overlay-box
    :visible="visible"
    :secure="false"
    @click="emit('close')"
  >
    <v-card style="min-width: 480px">
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
              @click.stop="emit('inspect', item)"
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
          @click="emit('push')"
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
          @click="emit('close')"
        >
          <v-icon class="mr-2">
            mdi-exit-to-app
          </v-icon>
          Back
        </v-btn>
      </v-card-actions>
    </v-card>
  </overlay-box>
</template>

<script setup lang="ts">
import OverlayBox from '@/components/OverlayBox.vue'
import {
  VAvatar,
  VBtn,
  VCard,
  VCardActions,
  VContainer,
  VDataTable,
  VIcon,
  VListItem,
  VListItemSubtitle,
  VListItemTitle,
  VProgressCircular,
  VSpacer,
} from 'vuetify/components'

export interface Properties {
  visible?: boolean
  disabled?: boolean
  waiting?: boolean
  history?: any[]
}

withDefaults(defineProps<Properties>(), {
  visible: false,
  disabled: false,
  waiting: false,
  history: () => [],
})

const emit = defineEmits([
  'inspect',
  'close',
  'push',
])

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
