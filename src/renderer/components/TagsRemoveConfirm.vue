<template>
  <overlay-box
    :visible="visible"
    :secure="false"
    @click="close"
  >
    <v-card style="width: 360px; max-width: 90vw !important;">
      <v-list-item class="my-2">
        <template #prepend>
          <v-avatar
            color="warning"
          >
            <v-icon>mdi-trash-can</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title class="text-h5 title">
          Remove Tag
        </v-list-item-title>
      </v-list-item>

      <v-card-text>
        This will remove the tag <strong>{{ tag }}</strong>,
        however the tagged content will remain in the repository
        &mdash; please confirm you would like to continue.
      </v-card-text>

      <v-card-actions>
        <v-btn
          ref="remove-button"
          color="warning"
          variant="text"
          @click="remove()"
        >
          <v-progress-circular
            :size="12"
            :width="2"
            color="warning"
            class="mr-2"
          />
          Remove
        </v-btn>
        <v-spacer />
        <v-btn
          ref="cancel-button"
          color="darken-1"
          variant="text"
          @click="close()"
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
  VProgressCircular,
  VSpacer,
} from 'vuetify/components'

export interface Properties {
  visible?: boolean
  tag?: string
}

withDefaults(defineProps<Properties>(), {
  visible: false,
  tag: '',
})

const emit = defineEmits([
  'remove',
  'close',
])

function remove () {
  close()
  emit('remove')
}

function close () {
  emit('close')
}
</script>
