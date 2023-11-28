<template>
  <v-card style="height: 100%">
    <template v-if="active">
      <template v-if="loading">
        <v-list-item>
          <template #prepend>
            <v-avatar color="darken-1">
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
            disable-sort
            class="my-0 commit-history"
            :headers="headers"
            :items="history"
            :hide-default-footer="true"
            :items-per-page="history.length"
            @click:row="$emit('click', $event)"
          >
            <template #item.oid="{ item }">
              <v-btn
                rounded="0"
                icon
                color="success"
              >
                {{ item.oid.substring(0, 7) }}
              </v-btn>
            </template>
          </v-data-table>
        </v-container>
      </template>
    </template>

    <template v-else>
      <v-list-item>
        <template #prepend>
          <v-avatar color="darken-1">
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
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import {
  VAvatar,
  VIcon,
  VListItem,
  VListItemTitle,
  VListItemSubtitle,
  VCard,
  VCardText,
  VDivider,
  VContainer,
  VDataTable,
  VBtn,
} from 'vuetify/components'

@Component({
  components: {
    VAvatar,
    VIcon,
    VListItem,
    VListItemTitle,
    VListItemSubtitle,
    VCard,
    VCardText,
    VDivider,
    VContainer,
    VDataTable,
    VBtn
  }
})
class PushStatus extends Vue {
  @Prop({ default: false })
  active: boolean

  @Prop({ default: false })
  loading: boolean

  @Prop({ default: false })
  match: boolean

  @Prop({ default: '' })
  error: string

  @Prop({ default: () => [] })
  history: any[]

  headers = [
    { title: '', value: 'oid', width: '60px' },
    { title: '', value: 'message', width: '' }
  ]
}

export default toNative(PushStatus)
</script>

<style scoped>
.passphrase.v-input .v-input__slot {
  min-height: 0px !important;
  border-radius: 0px;
}

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
