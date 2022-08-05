<template>
  <div>
    <v-label small>
      <span class="key-label">{{ label }}</span>
    </v-label>
    <div class="key-border">
      <v-textarea :value=value tile icon auto-grow readonly no-resize class="key-output"></v-textarea>
    </div>
  </div>
</template>

<style scoped>
.key-label {
  font-size: 0.8em;
}

.key-output {
  font-size: 1.0em;
  font-family: monospace !important;
  background: rgba(0, 0, 0, 0.05);
}
</style>

<script>
import { VLabel, VTextarea } from 'vuetify/lib'

export default {
  components: { VLabel, VTextarea },
  props: {
    value: { type: String, default: 'component default' },
    label: { type: String, default: '' }
  }
}
</script>
