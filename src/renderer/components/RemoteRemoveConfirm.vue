<template>
  <overlay-box
    :visible="visible"
    @click="emit('cancel')"
  >
    <v-card style="min-width: 480px">
      <v-list-item class="my-2">
        <template #prepend>
          <v-avatar color="warning">
            <v-icon>mdi-close-thick</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title class="text-h5 title">
          Remove Remote
        </v-list-item-title>
      </v-list-item>

      <v-card-text class="text-center">
        Are you sure you want to remove the remote named <strong>{{ name }}</strong>?
      </v-card-text>

      <v-card-actions>
        <v-btn
          ref="remove-button"
          color="warning"
          variant="text"
          @click="emit('remove')"
        >
          <v-icon class="mr-2">
            mdi-trash-can
          </v-icon>
          Remove
        </v-btn>
        <v-spacer />
        <v-btn
          ref="cancel-button"
          color="darken-1"
          variant="text"
          @click="emit('cancel')"
        >
          <v-icon class="mr-2">
            mdi-exit-to-app
          </v-icon>
          Cancel
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
  VCardText,
  VIcon,
  VListItem,
  VListItemTitle,
  VSpacer,
} from 'vuetify/components'

export interface Properties {
  visible: boolean
  name: string
}

withDefaults(defineProps<Properties>(), {
  visible: false,
  name: '',
})

const emit = defineEmits([
  'remove',
  'cancel',
])
</script>

<style scoped>
.author {
  font-family: var(--font-monospace), monospace !important;
  font-size: 1.2em;
}
</style>
