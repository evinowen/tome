<template>
  <v-dialog :value=value @input="$emit('input', $event)" persistent max-width="600px">
    <template v-slot:activator="{ on }">
      <v-btn class="mr-4" v-on="on" :disabled=disabled>
        <v-icon class="mr-2">mdi-content-save</v-icon>
        Save
      </v-btn>
    </template>

    <v-card>
      <v-list-item>
        <v-progress-circular
          v-if=staging
          indeterminate
          :size="40"
          :width="6"
          color="warning"
          class="mr-4"
        ></v-progress-circular>
        <v-list-item-avatar color="warning" v-else>
          <v-icon>mdi-hammer-wrench</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="headline">Commit</v-list-item-title>
          <v-list-item-subtitle>{{ status }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-card-text class="commit">
        <v-textarea class="pa-0 ma-0" counter=50 :value=message @input="$emit('message', $event)" no-resize>
        </v-textarea>
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
          text @click="$emit('commit')"
          :disabled="staging || waiting || message.length < 1"
        >
          <v-progress-circular
            :indeterminate="waiting"
            :size="12"
            :width="2"
            color="warning"
            class="mr-2"
          ></v-progress-circular>
          Proceed
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn :depressed=push :color="push ? 'warning' : ''" text @click="$emit('push', $event)">
          <v-icon class="mr-2">{{ push ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline' }}</v-icon>
          Push
        </v-btn>
        <v-btn color="darken-1" text @click="$emit('input', false)" :disabled="waiting">
          <v-icon class="mr-2">mdi-exit-to-app</v-icon>
          Back
        </v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>

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

<script>
export default {
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
      if (this.staging) {
        return 'Commit details are being staged ... '
      } else {
        return 'Commit is prepared and ready to publish'
      }
    }
  }
}
</script>
