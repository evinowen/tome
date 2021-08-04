<template>
  <v-bottom-sheet fullscreen scrollable persistent hide-overlay no-click-animation
    :value=value
    @input="$emit('input', $event)"
    style="margin-bottom: 18px"
  >
    <v-card>
      <v-btn tile class="pa-0" style="height: 16px; width: 100%" color="accent" @click.stop="$emit('close')">
        <v-icon small>mdi-chevron-down</v-icon>
      </v-btn>
      <div class="output">
        <pre v-for="(event, index) in events.slice().reverse()" :key=index>{{ event.message }}</pre>
      </div>
    </v-card>
  </v-bottom-sheet>
</template>

<style>
pre {
  display: block;
  margin: 0;
  padding: 2px 4px 1px;
  border-bottom: 1px dotted rgba(128,128,128,0.5)
}

pre:hover {
  background: var(--v-primary-base);
}

.v-dialog--fullscreen {
  height: auto;
  top: 25px;
  bottom: 18px;
}

.output {
  height: 100%;
  display: flex;
  overflow: auto;
  align-items: stretch;
  flex-direction: column-reverse;
}
</style>

<script>
import store from '@/store'

export default {
  props: {
    value: { type: Boolean, default: false }
  },
  data: () => ({
  }),
  computed: {
    events: function () {
      return store.state.events
    }
  }
}
</script>
