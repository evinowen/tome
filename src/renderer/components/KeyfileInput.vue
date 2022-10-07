<template>
  <v-layout class="key-border pt-1">
    <v-flex class="pa-1">
      <input ref="input" type="file" style="display: none" @change="input">
      <v-text-field
        :value="value || ' '" :label=label
        :class="[ value ? 'v-text-field-green' : 'v-text-field-red' ]"
        :color="value ? 'green' : 'red'"
        :prepend-inner-icon="value ? 'mdi-lock-open' : 'mdi-lock'"
        readonly
        outlined hide-details dense @click.stop="$refs.input.click()"
      />
    </v-flex>
    <v-btn
      tile icon :small=small style="height: auto;"
      :disabled="value === ''"
      @click.stop="$emit('input', '')"
    >
      <v-icon small>
        mdi-close
      </v-icon>
    </v-btn>
    <v-btn v-if=forge
           tile icon :small=small style="height: auto;"
           :disabled="value !== ''"
           @click.stop="$emit('forge')"
    >
      <v-icon small>
        mdi-anvil
      </v-icon>
    </v-btn>
    <v-btn v-if=storable
           tile icon :small=small style="height: auto;"
           :disabled="stored === ''"
           @click.stop="$emit('input', stored)"
    >
      <v-icon small>
        mdi-cog
      </v-icon>
    </v-btn>
  </v-layout>
</template>

<style scoped>
.key-label {
  font-size: 0.8em;
}

.key-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.05);
}

.v-text-field-red >>> fieldset {
  color: red;
  border-color: red;
}

.v-text-field-green >>> fieldset {
  color: green;
  border-color: green;
}
</style>

<script lang="ts">
import Vue from 'vue'
import { VIcon, VBtn, VTextField, VLayout, VFlex } from 'vuetify/lib'

export default Vue.extend({
  components: { VIcon, VBtn, VTextField, VLayout, VFlex },
  props: {
    value: { type: String, default: '' },
    forge: { type: Boolean, default: false },
    storable: { type: Boolean, default: false },
    stored: { type: String, default: '' },
    small: { type: Boolean, default: false },
    label: { type: String, default: '' },
    id: { type: String, default: '' }
  },
  computed: {
    color: function () {
      return this.value ? 'green' : 'red'
    }
  },
  methods: {
    input: async function (event) {
      const files = event.target.files || event.dataTransfer.files
      const file = files.length > 0 ? files[0] : null

      if (!file.path) {
        return
      }

      this.$emit('input', file.path)
      this.$refs.input.value = ''
    }
  }
})
</script>