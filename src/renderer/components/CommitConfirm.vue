<template>
  <v-dialog
    :model-value="value"
    persistent
    max-width="600px"
    @update:model-value="$emit('input', $event)"
  >
    <template #activator="{ props }">
      <v-btn
        class="mr-4"
        :disabled="disabled"
        v-bind="props"
      >
        <v-icon class="mr-2">
          mdi-content-save
        </v-icon>
        Save
      </v-btn>
    </template>

    <v-card>
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
        <v-list-item-title class="text-h5">
          Commit
        </v-list-item-title>
        <v-list-item-subtitle>{{ status }}</v-list-item-subtitle>
      </v-list-item>

      <v-divider />

      <v-card-text class="commit">
        <v-textarea
          class="pa-0 ma-0"
          counter="50"
          :model-value="message"
          no-resize
          @update:model-value="$emit('message', $event)"
        />
      </v-card-text>

      <v-container class="py-0 px-4">
        <v-row>
          <v-col class="author text-right">
            {{ name }} &lt;{{ email }}&gt;
          </v-col>
        </v-row>
      </v-container>

      <v-card-actions>
        <v-btn
          ref="commit"
          color="warning"
          variant="text"
          :disabled="staging || waiting"
          @click="$emit('commit')"
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
          :color="push ? 'warning' : ''"
          variant="text"
          @click="$emit('push', !push)"
        >
          <v-icon class="mr-2">
            {{ push ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
          </v-icon>
          Push
        </v-btn>
        <v-btn
          color="darken-1"
          variant="text"
          :disabled="waiting"
          @click="$emit('input', false)"
        >
          <v-icon class="mr-2">
            mdi-exit-to-app
          </v-icon>
          Back
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, toNative } from 'vue-facing-decorator'
import {
  VAvatar,
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCol,
  VContainer,
  VDialog,
  VDivider,
  VIcon,
  VListItem,
  VListItemSubtitle,
  VListItemTitle,
  VProgressCircular,
  VRow,
  VSpacer,
  VTextarea,
} from 'vuetify/components'

export const CommitConfirmMessages = {
  Staging: 'Commit details are being staged ... ',
  Ready: 'Commit is prepared and ready to publish'
}

@Component({
  components: {
    VAvatar,
    VBtn,
    VCard,
    VCardActions,
    VCardText,
    VCol,
    VContainer,
    VDialog,
    VDivider,
    VIcon,
    VListItem,
    VListItemSubtitle,
    VListItemTitle,
    VProgressCircular,
    VRow,
    VSpacer,
    VTextarea,
  },
  emits: [
    'commit',
    'input',
    'message',
    'push',
  ]
})
class CommitConfirm extends Vue {
  @Prop({ default: false })
  value!: boolean

  @Prop({ default: '' })
  name!: string

  @Prop({ default: '' })
  email!: string

  @Prop({ default: '' })
  message!: string

  @Prop({ default: false })
  disabled!: boolean

  @Prop({ default: false })
  staging!: boolean

  @Prop({ default: false })
  waiting!: boolean

  @Prop({ default: false })
  push!: boolean

  get status () {
    return this.staging
      ? CommitConfirmMessages.Staging
      : CommitConfirmMessages.Ready
  }
}

export default toNative(CommitConfirm)
</script>

<style scoped>
.commit {
  font-family: monospace;
  min-height: 120px;
  padding: 0 !important;
  font-size: 18px;
  line-height: 1.0em !important;
}

.commit :deep(v-field__input) {
  -webkit-mask-image: none;
  mask-image: none;
}

.commit .v-textarea textarea {
  padding: 4px;
}

.author {
  font-family: monospace;
  font-size: 1.2em;
}
</style>
