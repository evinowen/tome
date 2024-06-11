<template>
  <overlay-box
    :visible="option.visible"
  >
    <v-card>
      <v-card-item>
        <template #prepend>
          <v-avatar color="info">
            <v-icon>mdi-help-circle</v-icon>
          </v-avatar>
        </template>
        <v-card-title>
          {{ option.title }}
        </v-card-title>
      </v-card-item>
      <v-card-text>
        <div>{{ option.message }}</div>
        <div><strong>{{ option.question }}</strong></div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          ref="confirm-button"
          color="success"
          class="px-2"
          @click="confirm"
        >
          <v-icon class="mr-2">
            mdi-check
          </v-icon>
          Yes
        </v-btn>
        <v-btn
          ref="close-button"
          color="warning"
          class="px-4"
          @click="close"
        >
          <v-icon class="mr-2">
            mdi-cancel
          </v-icon>
          No
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="option.help_tag"
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
import { fetch_option_store } from '@/store/modules/option'

const option = fetch_option_store()

async function confirm () {
  await option.confirm()
}

async function close () {
  await option.hide()
}

async function help () {
  await option.help()
}

defineExpose({
  close,
  help,
})
</script>
