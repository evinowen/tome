<template>
  <overlay-box
    :visible="visible"
  >
    <v-card>
      <v-card-item>
        <template #prepend>
          <v-avatar color="error">
            <v-icon>mdi-alert-circle</v-icon>
          </v-avatar>
        </template>
        <v-card-title>
          {{ title }}
        </v-card-title>
      </v-card-item>
      <v-card-text class="commit">
        {{ message }}
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
          v-if="store.state.error.help"
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
import { computed } from 'vue'
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
import { fetchStore } from '@/store'

const store = fetchStore()
const visible = computed(() => store.state.error.visible)
const title = computed(() => store.state.error.title)
const message = computed(() => store.state.error.message)

async function confirm () {
  await store.dispatch('error/hide')
}

async function help () {
  await store.dispatch('error/help')
}

defineExpose({
  confirm,
  help,
  visible,
})
</script>
