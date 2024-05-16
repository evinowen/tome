<template>
  <div
    ref="overlay"
    :class="[
      'overlay',
      { 'visible': visible },
    ]"
    @click="bounce"
  >
    <v-card
      :class="[
        'card',
        { 'enlarge': enlarge }
      ]"
      :link="false"
      @click.stop.prevent
    >
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
const ticker = ref<ReturnType<typeof setTimeout>>()
const enlarge = ref(false)
const visible = computed(() => store.state.error.visible)
const title = computed(() => store.state.error.title)
const message = computed(() => store.state.error.message)

async function bounce () {
  enlarge.value = true
  ticker.value = setTimeout(() => enlarge.value = false, 50)
}

async function confirm () {
  await store.dispatch('error/hide')
}

async function help () {
  await store.dispatch('error/help')
}

defineExpose({
  confirm,
  enlarge,
  help,
  visible,
})
</script>

<style scoped>
.overlay {
  background: rgba(var(--v-theme-on-background), 0.25);
  justify-content: center;
  align-items: center;
  display: flex;
  height: calc(100vh - 25px);
  left: 0;
  position: fixed;
  top: 25px;
  width: 100vw;
  opacity: 0;
  pointer-events: none;
  transition: all 0.15s ease-in-out;
  z-index: 100000;
}

.overlay.visible {
  opacity: 1;
  pointer-events: all;
}

.card {
  transition: all 0.05s ease-in-out;
}

.card.enlarge {
  transform: scale(1.05)
}
</style>
