<template>
  <overlay-box
    :visible="visible"
    :secure="false"
    @click="emit('close')"
  >
    <v-card style="min-width: 480px">
      <v-list-item class="my-2">
        <template #prepend>
          <v-progress-circular
            v-if="staging"
            indeterminate
            :size="40"
            :width="6"
            color="secondary"
            class="mr-4"
          />
          <v-avatar
            v-else
            color="warning"
          >
            <v-icon>mdi-hammer-wrench</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title class="text-h5 title">
          Commit
        </v-list-item-title>
        <v-list-item-subtitle>{{ status }}</v-list-item-subtitle>
      </v-list-item>

      <v-card-text class="pa-0">
        <message-input
          class="my-1"
          :value="message"
          :signature_name="name"
          :signature_email="email"
          @update="(value) => emit('message', value)"
        />
      </v-card-text>

      <v-card-actions>
        <v-btn
          ref="commit-button"
          color="warning"
          variant="text"
          :disabled="staging || waiting"
          @click="emit('commit')"
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
          ref="push-button"
          :color="push ? 'warning' : ''"
          variant="text"
          @click="emit('push', !push)"
        >
          <v-icon class="mr-2">
            {{ push ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
          </v-icon>
          Push
        </v-btn>
        <v-btn
          ref="return-button"
          color="darken-1"
          variant="text"
          :disabled="waiting"
          @click="emit('close', false)"
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

<script lang="ts">
export const CommitConfirmMessages = {
  Staging: 'Commit details are being staged ... ',
  Ready: 'Commit is prepared and ready to publish',
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import OverlayBox from '@/components/OverlayBox.vue'
import MessageInput from '@/components/Input/MessageInput.vue'
import {
  VAvatar,
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VIcon,
  VListItem,
  VListItemSubtitle,
  VListItemTitle,
  VProgressCircular,
  VSpacer,
} from 'vuetify/components'

export interface Properties {
  visible?: boolean
  name?: string
  email?: string
  message?: string
  disabled?: boolean
  staging?: boolean
  waiting?: boolean
  push?: boolean
}

const properties = withDefaults(defineProps<Properties>(), {
  visible: false,
  name: '',
  email: '',
  message: '',
  disabled: false,
  staging: false,
  waiting: false,
  push: false,
})

const emit = defineEmits([
  'commit',
  'close',
  'message',
  'push',
])

const status = computed(() => {
  return properties.staging
    ? CommitConfirmMessages.Staging
    : CommitConfirmMessages.Ready
})

defineExpose({
  status,
})
</script>

<style scoped>
.author {
  font-family: var(--font-monospace), monospace !important;
  font-size: 1.2em;
}
</style>
