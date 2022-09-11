<template>
    <v-layout>
      <v-flex class="pa-1">
        <v-text-field
          :value="value"
          @input="$emit('input', $event)"
          :type="obscured ? 'password' : 'text'"
          outlined hide-details dense
          label="passphrase"
        />
      </v-flex>
      <v-btn
        tile icon small style="height: auto;"
        @click.stop="$emit('input', '')"
        :disabled="value === ''"
      >
        <v-icon small>mdi-close</v-icon>
      </v-btn>
      <v-btn
        tile icon small style="height: auto;"
        @click.stop="obscured = !obscured"
      >
        <v-icon small>{{ obscured ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
      </v-btn>
      <v-btn v-if=storable
        tile icon small style="height: auto;"
        :disabled="stored === ''"
        @click.stop="$emit('input', stored)"
      >
        <v-icon small>mdi-cog</v-icon>
      </v-btn>
    </v-layout>
</template>

<script>
import { VLayout, VFlex, VBtn, VIcon, VTextField } from 'vuetify/lib'

export default {
  components: { VLayout, VFlex, VBtn, VIcon, VTextField },
  props: {
    value: { type: String, default: '' },
    storable: { type: Boolean, default: false },
    stored: { type: String, default: '' }
  },
  data: () => ({
    obscured: true
  })
}
</script>
