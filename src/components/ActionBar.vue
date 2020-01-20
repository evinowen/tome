<template>
  <v-footer
    app dark
    color="grey darken-3" class="pa-0"
    height=28
  >
    <input ref="tome" type="file" style="display: none" webkitdirectory @change="open" />
    <v-btn tile icon small dark color="red" class="pa-0" @click.stop="$refs.tome.click();">
      <v-icon small>mdi-bookshelf</v-icon>
    </v-btn>

    <v-divider inset vertical />

    <template v-if="tome.path">
      <v-menu top offset-y transition="slide-y-reverse-transition">

        <template v-slot:activator="{ on: on_click }">
          <v-tooltip top>
            <template v-slot:activator="{ on: on_hover }">
              <v-btn tile icon small class="pa-0 px-2" v-on="{ ...on_hover, ...on_click }">
                {{ tome.name }}
              </v-btn>
            </template>

            <span>{{ tome.path }}</span>

          </v-tooltip>
        </template>

        <v-list dark dense>
          <v-list-item
            v-for="(item, index) in menu"
            :key="index" dense dark
            @click.stop="$emit('menu', item.key)"
          >
            <v-list-item-title>{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ item.text }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>

      </v-menu>

      <v-divider inset vertical />

      <v-btn v-if="tome.branch.name" tile small icon class="px-2" color="primary">{{ tome.branch.name }}</v-btn>
      <v-btn v-else-if="tome.branch.error" tile small icon class="pl-1 pr-2" color="error">
        <v-icon small dark class="pr-1">mdi-alert-box</v-icon>
        {{ tome.branch.error }}
      </v-btn>

      <v-divider inset vertical />

      <v-spacer></v-spacer>

      <v-divider inset vertical />

      <v-switch v-model="edit" dense x-small inset hide-details class="edit_switch"></v-switch>

      <v-divider inset vertical />

      <v-expand-x-transition>
        <div v-show="edit" style="overflow: hidden;">
          <div class="grey darken-4" style="height: 28px">

            <!-- STAGE BUTTON -->
            <status-button
              :waiting="waiting"
              :available_new="tome.status.available.new"
              :available_renamed="tome.status.available.renamed"
              :available_modified="tome.status.available.modified"
              :available_removed="tome.status.available.deleted"
              :staged_new="tome.status.staged.new"
              :staged_renamed="tome.status.staged.renamed"
              :staged_modified="tome.status.staged.modified"
              :staged_removed="tome.status.staged.deleted"
            />

            <!-- SAVE BUTTON -->
            <v-btn tile small icon color="primary" class="pa-0" @click.stop="$emit('commit')" :disabled="commit || push">
              <v-icon small>mdi-content-save</v-icon>
            </v-btn>

            <!-- PUSH BUTTON -->
            <v-btn tile small icon color="accent" class="pa-0" @click.stop="$emit('push')" :disabled="commit || push">
              <v-icon small>mdi-upload-multiple</v-icon>
            </v-btn>

          </div>
        </div>
      </v-expand-x-transition>

    </template>

  </v-footer>
</template>

<style scoped>
.edit_switch {
  padding-top: 2px !important;
  margin: 0 !important;
}

.edit_switch .v-input--selection-controls__input {
  margin-left: 10px !important;
  margin-right: 0 !important;
}

</style>

<script>
  import StatusButton from "./StatusButton.vue";

  export default {
    props: {
      tome: { type: Object },
      menu: { type: Array, default: () => [] },
      waiting: { type: Number, default: 0 },
      waiting_max: { type: Number, default: 3 },
      commit: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },

    data: () => ({
      edit: false,
    }),

    watch: {
      edit: function(value) { this.$emit('edit', value); },
    },

    methods: {
      open: function (event) {
        let files = event.target.files || event.dataTransfer.files;

        if (!files.length) {
          this.$emit('close');
          return;

        }

        if (!files[0].path) {
          this.$emit('close');
          return;

        }

        this.$emit('open', files[0].path);

      },

    },

    components: {
      StatusButton,

    },
  }
</script>
