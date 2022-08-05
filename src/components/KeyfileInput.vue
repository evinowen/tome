<template>
  <div>
    <v-label :for=id small>
      <span class="key-label">{{ label }}</span>
    </v-label>
    <v-layout class="key-border pt-1">
      <v-flex>
        <input ref="input" type="file" style="display: none" @change="input" />
        <v-btn :id=id tile icon :small=small :color=color class="key-input" @click.stop="$refs.input.click()">
          <v-icon small>{{ value ? "mdi-lock-open" : "mdi-lock" }}</v-icon>
          {{ value }}
        </v-btn>
      </v-flex>
      <v-btn v-if=forge
        tile icon :small=small class="pa-0"
        @click.stop="$emit('forge')"
        :disabled="value !== ''"
      >
        <v-icon small>mdi-anvil</v-icon>
      </v-btn>
      <v-btn v-if=storable
        tile icon :small=small class="pa-0"
        :disabled="stored === ''"
        @click.stop="$emit('input', stored)"
      >
        <v-icon small>mdi-cog</v-icon>
      </v-btn>
      <v-btn
        tile icon :small=small class="pa-0"
        @click.stop="$emit('input', '')"
        :disabled="value === ''"
      >
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </v-layout>
  </div>
</template>

<style scoped>
.key-label {
  font-size: 0.8em;
}

.key-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.05);
}
</style>

<script>
import { VIcon, VBtn, VLabel, VLayout, VFlex } from 'vuetify/lib'

export default {
  components: { VIcon, VBtn, VLabel, VLayout, VFlex },
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
      const file = files.length ? files[0] : null

      if (!file.path) {
        return
      }

      this.$emit('input', file.path)
    }
  }
}
</script>
