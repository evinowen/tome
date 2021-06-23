<template>
  <v-dialog v-model=open @input="$emit('input', $event)" persistent max-width="600px">
    <template v-slot:activator="{ on }">
      <v-btn class="mr-4" v-on="on" style="width: 100%" :disabled=disabled>
        <v-icon class="mr-2">mdi-content-save</v-icon>
        Save
      </v-btn>
    </template>

    <v-card>
      <v-list-item>
        <v-list-item-avatar color="red">
          <v-icon dark>mdi-hammer-wrench</v-icon>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="headline">Commit</v-list-item-title>
          <v-list-item-subtitle>Commit is prepared and ready to publish</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-card-text class="commit">
        {{ message }}
      </v-card-text>

      <v-divider></v-divider>

      <v-container class="author text-right">
      {{ name }} &lt;{{ email }}&gt;
      </v-container>

      <v-card-actions>
        <v-btn
          ref="commit"
          color="orange darken-1"
          text @click="$emit('commit')"
          :disabled="waiting"
        >
          <v-progress-circular
            :indeterminate="waiting"
            :size="12"
            :width="2"
            color="orange darken-1"
            class="mr-2"
          ></v-progress-circular>
          Proceed
        </v-btn>
        <v-spacer></v-spacer>
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
  padding: 0 4px !important;
  font-size: 24px;
  line-height: 1.0em !important;
  background: repeating-linear-gradient(
    to bottom,
    #EFEFEF,
    #EFEFEF 24px,
    #F8F8F8 24px,
    #F8F8F8 48px
  );
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
    waiting: { type: Boolean, default: false }
  },
  data: () => ({
    open: false
  }),
  watch: {
    value: function (value) { this.open = value }
  }
}
</script>
