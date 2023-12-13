<template>
  <v-card style="height: 100%">
    <template v-if="active">
      <template v-if="loading">
        <v-list-item>
          <template #prepend>
            <v-avatar color="grey">
              <v-icon>mdi-upload-multiple</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-h5">
            &mdash;
          </v-list-item-title>
          <v-list-item-subtitle>Loading ... </v-list-item-subtitle>
        </v-list-item>
        <v-divider />
        <v-card-text class="text-center">
          &mdash;
        </v-card-text>
      </template>

      <template v-else-if="error">
        <v-list-item>
          <template #prepend>
            <v-avatar color="warning">
              <v-icon>mdi-alert</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-h5">
            Error
          </v-list-item-title>
          <v-list-item-subtitle>{{ error }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider />
        <v-card-text class="text-center">
          <v-btn @click.stop="$emit('reload')">
            <v-icon class="mr-2">
              mdi-reload
            </v-icon>
            Retry
          </v-btn>
        </v-card-text>
      </template>

      <template v-else-if="match">
        <v-list-item>
          <template #prepend>
            <v-avatar color="info">
              <v-icon>mdi-thumb-up</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-h5">
            Match
          </v-list-item-title>
          <v-list-item-subtitle>The local repository history matches the remote repository</v-list-item-subtitle>
        </v-list-item>
        <v-divider />
        <v-card-text class="text-center">
          &mdash;
        </v-card-text>
      </template>

      <template v-else>
        <v-list-item>
          <template #prepend>
            <v-avatar color="success">
              <v-icon>mdi-check</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="text-h5">
            Compare
          </v-list-item-title>
          <v-list-item-subtitle>View the commit history difference below</v-list-item-subtitle>
        </v-list-item>
        <v-container
          fluid
          class="pa-0 ma-0"
          style="min-height: 120px"
        >
          <v-data-table
            density="compact"
            hide-header
            disable-sort
            class="mt-2 mb-0 commit-history"
            :height="320"
            :headers="headers"
            :items="history"
            :hide-default-footer="true"
            :items-per-page="history.length"
          >
            <template #headers />

            <template #item.oid="{ item }">
              <v-btn
                rounded="0"
                variant="text"
                color="success"
                @click.stop="$emit('commit', item)"
              >
                {{ item.oid.substring(0, 7) }}
              </v-btn>
            </template>

            <template #bottom />
          </v-data-table>
        </v-container>
      </template>
    </template>

    <template v-else>
      <v-list-item>
        <template #prepend>
          <v-avatar color="grey">
            <v-icon>mdi-cursor-pointer</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title class="text-h5">
          Select Remote
        </v-list-item-title>
        <v-list-item-subtitle>Choose a remote to compare to the local repository</v-list-item-subtitle>
      </v-list-item>
      <v-divider />
      <v-card-text class="text-center">
        &mdash;
      </v-card-text>
    </template>
  </v-card>
</template>

<script lang="ts">
import {
  VAvatar,
  VBtn,
  VCard,
  VCardText,
  VContainer,
  VDataTable,
  VDivider,
  VIcon,
  VListItem,
  VListItemSubtitle,
  VListItemTitle,
} from 'vuetify/components'

export default {
  components: {
    VAvatar,
    VBtn,
    VCard,
    VCardText,
    VContainer,
    VDataTable,
    VDivider,
    VIcon,
    VListItem,
    VListItemSubtitle,
    VListItemTitle,
  },
  emits: [
    'commit',
    'reload',
  ]
}
</script>

<script setup lang="ts">
export interface Props {
  active: boolean,
  loading: boolean,
  match: boolean,
  error: string,
  history: any[],
}

withDefaults(defineProps<Props>(), {
  active: false,
  loading: false,
  match: false,
  error: '',
  history: () => [],
})

const headers = [
  { title: '', value: 'oid', width: '60px' },
  { title: '', value: 'message', width: '' }
]
</script>

<style scoped>
.v-data-table.commit-history {
  border-radius: 0;
  flex-grow: 1;
}

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
