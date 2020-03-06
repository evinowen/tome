<template>
  <v-btn
    tile small
    class="px-2 grey--text text--lighten-1"
    style="height: 18px;"
  >
    <v-progress-circular
      :value="(waiting * 100) / waiting_max"
      :size="12"
      :width="2"
      color="orange darken-1"
      class="mr-2"
    ></v-progress-circular>
    <strong v-if="available_added" class="green--text">{{ available_added }}</strong>
    <strong v-else>0</strong>
    <strong>/</strong>
    <strong v-if="available_removed" class="red--text">{{ available_removed }}</strong>
    <strong v-else>0</strong>
    <strong>&bull;</strong>
    <strong v-if="staged_added" class="lime--text">{{ staged_added }}</strong>
    <strong v-else>0</strong>
    <strong>/</strong>
    <strong v-if="staged_removed" class="orange--text">{{ staged_removed }}</strong>
    <strong v-else>0</strong>
  </v-btn>
</template>

<script>
export default {
  props: {
    waiting: { type: Number, default: 0 },
    waiting_max: { type: Number, default: 3 },
    available_new: { type: Number, default: 0 },
    available_renamed: { type: Number, default: 0 },
    available_modified: { type: Number, default: 0 },
    available_removed: { type: Number, default: 0 },
    staged_new: { type: Number, default: 0 },
    staged_renamed: { type: Number, default: 0 },
    staged_modified: { type: Number, default: 0 },
    staged_removed: { type: Number, default: 0 }
  },
  data: () => ({
  }),
  computed: {
    available_added: function () {
      return this.available_new + this.available_renamed + this.available_modified
    },
    staged_added: function () {
      return this.staged_new + this.staged_renamed + this.staged_modified
    }
  }
}
</script>
