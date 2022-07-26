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
        <div
          v-for="(event, index) in events.slice().reverse()"
          :key=index
          :class="['log', `event-${event.type}`]"
          @click.stop="() => { show_stack(event.stack || event.message) }"
        >
          <pre class="pre datetime">{{ event.datetime.toISODate() }}</pre>
          <pre :class="['pre', `event-${event.type}`, 'px-2']">{{ event.type.padEnd(6) }}</pre>
          <pre class="pre message">{{ format_message(event.message) }}</pre>
        </div>
      </div>
    </v-card>
    <v-snackbar v-model=detail multi-line centered vertical>
      <pre>{{ stack }}</pre>
      <template v-slot:action="{}">
        <v-btn tile small color="primary" @click.stop="detail = false">Done</v-btn>
      </template>
    </v-snackbar>
  </v-bottom-sheet>
</template>
<style>
.v-dialog--fullscreen {
  height: auto;
  top: 25px;
  bottom: 18px;
}
</style>

<style scoped>
.log {
  display: flex;
  margin: 0;
  padding: 2px 4px 1px;
  border-bottom: 1px dotted rgba(128,128,128,0.5)
}

.log.event-info:hover {
  background: var(--v-info-base);
}

.log.event-info:hover .pre.event-info {
  color: var(--v-info-lighten4);
}

.log.event-error:hover {
  background: var(--v-error-base);
}

.log.event-error:hover .pre.event-error {
  color: var(--v-error-lighten4);
}

.pre {
  display: flex;
  flex-shrink: 0;
  width: 80px;
  overflow: hidden;
}

.pre.message {
  width: auto;
  flex-shrink: 1;
}

.pre.event-info {
  color: var(--v-info-base);
}

.pre.event-error {
  color: var(--v-error-base);
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
import { VIcon, VBtn, VCard, VBottomSheet, VSnackbar } from 'vuetify/lib'
import store from '@/store'

export default {
  components: { VIcon, VBtn, VCard, VBottomSheet, VSnackbar },
  props: {
    value: { type: Boolean, default: false }
  },
  data: () => ({
    detail: false,
    stack: ''
  }),
  methods: {
    show_stack: function (stack) {
      this.stack = stack.trim()

      if (this.stack) {
        this.detail = true
      }
    },
    format_message: function (message) {
      return message
        .replace(/\r/g, '\u240D')
        .replace(/\n/g, '\u2424')
    }
  },
  computed: {
    events: function () {
      return store.state.events
    }
  }
}
</script>
