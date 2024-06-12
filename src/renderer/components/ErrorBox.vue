<template>
  <overlay-box
    :visible="error.visible"
  >
    <v-card>
      <v-card-item>
        <template #prepend>
          <v-avatar color="error">
            <v-icon>mdi-alert-circle</v-icon>
          </v-avatar>
        </template>
        <v-card-title>
          {{ error.title }}
        </v-card-title>
      </v-card-item>
      <v-card-text>
        {{ error.message }}
      </v-card-text>
      <v-card-actions>
        <v-btn
          ref="confirm-button"
          @click="confirm"
        >
          <v-icon class="mr-2">
            mdi-exit-to-app
          </v-icon>
          Confirm
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="error.help_tag"
          ref="help-button"
          @click="help"
        >
          <v-icon class="mr-2">
            mdi-help
          </v-icon>
          Help
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
  VCardItem,
  VCardText,
  VCardTitle,
  VIcon,
  VSpacer,
} from 'vuetify/components'
import { fetch_error_store } from '@/store/modules/error'

const error = fetch_error_store()

async function confirm () {
  await error.hide()
}

async function help () {
  await error.help()
}

defineExpose({
  confirm,
  help,
})
</script>
