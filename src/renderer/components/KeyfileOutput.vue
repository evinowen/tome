<template>
  <v-layout class="key-border pt-1">
    <v-flex class="pa-1">
      <v-text-field
        :value="value || ' '" :label=label
        class="key-output"
        readonly outlined hide-details
      />
    </v-flex>
    <v-btn
      tile icon :small=small style="height: auto;"
      :disabled="value === ''"
      @click.stop=copy
    >
      <v-icon small>
        mdi-content-copy
      </v-icon>
    </v-btn>
  </v-layout>
</template>

<style scoped>
.key-output {
  font-family: monospace !important;
}
</style>

<script lang="ts">
import Vue from 'vue'
import { VIcon, VBtn, VTextField, VLayout, VFlex } from 'vuetify/lib'
import store from '@/store'

export default Vue.extend({
  components: { VIcon, VBtn, VTextField, VLayout, VFlex },
  props: {
    value: { type: String, default: '' },
    small: { type: Boolean, default: false },
    label: { type: String, default: '' }
  },
  methods: {
    copy: async function () {
      await store.dispatch('clipboard/text', this.value)
    }
  }
})
</script>
