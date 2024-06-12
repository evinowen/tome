<template>
  <overlay-box
    :visible="system.commit_confirm"
    :secure="false"
    @click="close"
  >
    <v-card style="width: 480px; max-width: 95vw;">
      <v-list-item class="my-2">
        <template #prepend>
          <v-progress-circular
            v-if="repository_committer.process.staging"
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
        <template #append>
          <v-btn
            ref="generate-button"
            :disabled="repository_committer.message.length > 0"
            size="small"
            @click="generate"
          >
            Generate
          </v-btn>
        </template>
        <v-list-item-title class="text-h5 title">
          Commit
        </v-list-item-title>
        <v-list-item-subtitle>{{ status }}</v-list-item-subtitle>
      </v-list-item>

      <v-card-text class="pa-0">
        <commit-message-input class="my-1" />
      </v-card-text>

      <v-card-actions>
        <v-btn
          ref="commit-button"
          color="warning"
          variant="text"
          :disabled="repository_committer.process.staging || repository_committer.process.commit"
          @click="commit"
        >
          <v-progress-circular
            :indeterminate="repository_committer.process.commit"
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
          @click="push = !push"
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
          :disabled="repository_committer.process.commit"
          @click="close"
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
import { computed, ref, watch } from 'vue'
import OverlayBox from '@/components/OverlayBox.vue'
import CommitMessageInput from '@/components/Commit/CommitMessageInput.vue'
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
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_system_store, SystemPerformance } from '@/store/modules/system'
import { fetch_repository_committer_store } from '@/store/modules/repository/committer'
import CommitError from '@/objects/errors/CommitError'

const configuration = fetch_configuration_store()
const system = fetch_system_store()
const repository_committer = fetch_repository_committer_store()

const push = ref(false)

watch(() => system.commit_confirm, () => {
  if (system.commit_confirm) {
    push.value = configuration.active.auto_push
  }
})

const status = computed(() => {
  return repository_committer.process.staging
    ? CommitConfirmMessages.Staging
    : CommitConfirmMessages.Ready
})

async function generate () {
  await repository_committer.compose(undefined, true)
}

async function commit () {
  if (await CommitError()) {
    return
  }

  if (!await system.perform(SystemPerformance.Commit)) {
    return
  }

  await system.page({ commit_confirm: false })
  await system.page({ commit: false })

  if (push.value) {
    await system.perform(SystemPerformance.QuickPush)
  }
}

async function close () {
  await system.page({ commit_confirm: false })
}

defineExpose({
  push,
  generate,
  status,
})
</script>

<style scoped>
.author {
  font-family: var(--font-monospace), monospace !important;
  font-size: 1.2em;
}
</style>
