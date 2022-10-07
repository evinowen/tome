<template>
  <v-layout>
    <v-flex class="pa-1">
      <v-text-field
        :value="value"
        :type="obscured ? 'password' : 'text'"
        outlined
        hide-details dense label="passphrase"
        @input="$emit('input', $event)"
      />
    </v-flex>
    <v-btn
      tile icon small style="height: auto;"
      :disabled="value === ''"
      @click.stop="$emit('input', '')"
    >
      <v-icon small>
        mdi-close
      </v-icon>
    </v-btn>
    <v-btn
      tile icon small style="height: auto;"
      @click.stop="obscured = !obscured"
    >
      <v-icon small>
        {{ obscured ? 'mdi-eye-off' : 'mdi-eye' }}
      </v-icon>
    </v-btn>
    <v-btn v-if=storable
           tile icon small style="height: auto;"
           :disabled="stored === ''"
           @click.stop="$emit('input', stored)"
    >
      <v-icon small>
        mdi-cog
      </v-icon>
    </v-btn>
  </v-layout>
</template>

<script lang="ts">
import Vue from 'vue'
import { VLayout, VFlex, VBtn, VIcon, VTextField } from 'vuetify/lib'

export default Vue.extend({
  components: { VLayout, VFlex, VBtn, VIcon, VTextField },
  props: {
    value: { type: String, default: '' },
    storable: { type: Boolean, default: false },
    stored: { type: String, default: '' }
  },
  data: () => ({
    obscured: true
  })
})
</script>
