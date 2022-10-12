<template>
  <v-dialog :value="value" persistent max-width="600px" @input="$emit('input', $event)">
    <template #activator="{ on }">
      <v-btn class="mr-4" :disabled="disabled" v-on="on">
        <v-icon class="mr-2">
          mdi-content-save
        </v-icon>
        Save
      </v-btn>
    </template>

    <v-card>
      <v-list-item>
        <v-progress-circular
          v-if="staging"
          indeterminate
          :size="40"
          :width="6"
          color="warning"
          class="mr-4"
        />
        <v-list-item-avatar v-else color="warning">
          <v-icon>mdi-hammer-wrench</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="headline">
            Commit
          </v-list-item-title>
          <v-list-item-subtitle>{{ status }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider />

      <v-card-text class="commit">
        <v-textarea class="pa-0 ma-0" counter="50" :value="message" no-resize @input="$emit('message', $event)" />
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
          text :disabled="staging || waiting"
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
        <v-btn :depressed="push" :color="push ? 'warning' : ''" text @click="$emit('push', !push)">
          <v-icon class="mr-2">
            {{ push ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}
          </v-icon>
          Push
        </v-btn>
        <v-btn color="darken-1" text :disabled="waiting" @click="$emit('input', false)">
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
import Vue from 'vue'
import {
  VIcon,
  VBtn,
  VSpacer,
  VProgressCircular,
  VCard,
  VCardActions,
  VRow,
  VCol,
  VContainer,
  VCardText,
  VDivider,
  VDialog,
  VListItem,
  VListItemTitle,
  VListItemSubtitle,
  VListItemAvatar,
  VListItemContent,
  VTextarea
} from 'vuetify/lib'

export const CommitConfirmMessages = {
  Staging: 'Commit details are being staged ... ',
  Ready: 'Commit is prepared and ready to publish'
}

export default Vue.extend({
  components: {
    VIcon,
    VBtn,
    VSpacer,
    VProgressCircular,
    VCard,
    VCardActions,
    VRow,
    VCol,
    VContainer,
    VCardText,
    VDivider,
    VDialog,
    VListItem,
    VListItemTitle,
    VListItemSubtitle,
    VListItemAvatar,
    VListItemContent,
    VTextarea
  },
  props: {
    value: { type: Boolean, default: false },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    message: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    staging: { type: Boolean, default: false },
    waiting: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  computed: {
    status: function () {
      return this.staging
        ? CommitConfirmMessages.Staging
        : CommitConfirmMessages.Ready
    }
  }
})
</script>

<style>
.commit {
  font-family: monospace;
  min-height: 120px;
  padding: 0 !important;
  font-size: 18px;
  line-height: 1.0em !important;
}

.commit .v-textarea textarea {
  padding: 4px;
}

.author {
  font-family: monospace;
  font-size: 1.2em;
}
</style>
