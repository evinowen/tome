<template>
  <console-page
    :layer="8"
    :open="system.console"
    @close="close"
  >
    <v-dialog
      v-model="detail"
      :scrim="false"
    >
      <v-card>
        <v-card-text class="text">
          {{ stack }}
        </v-card-text>
        <v-card-actions>
          <v-btn
            block
            size="small"
            @click.stop="detail = false"
          >
            Done
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div class="output">
      <div
        v-for="(event, index) in events.slice().reverse()"
        :key="index"
        :class="['log', `event-${event.level}`]"
        @click.stop="() => show_stack(event.stack || event.message)"
      >
        <pre class="pre datetime">{{ format_date(event.datetime) }}</pre>
        <pre :class="['pre', `event-${event.level}`, 'px-2']">{{ (event.level || 'unknown').padEnd(6) }}</pre>
        <pre class="pre message">{{ format_message(event.message) }}</pre>
      </div>
    </div>
  </console-page>
</template>

<script lang="ts">
import ConsolePage from './ConsolePage.vue'
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VDialog,
} from 'vuetify/components'

export default {
  components: {
    ConsolePage,
    VBtn,
    VCard,
    VCardActions,
    VCardText,
    VDialog,
  },
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { fetchStore } from '@/store'
import { DateTime } from 'luxon'

const store = fetchStore()

const detail = ref(false)
const stack = ref('')

const system = computed(() => store.state.system)
const events = computed(() => store.state.events)

async function close () {
  await store.dispatch('system/console', false)
}

function show_stack (input: string) {
  stack.value = String(input).trim()

  if (stack.value) {
    detail.value = true
  }
}

function format_date (datetime) {
  return `${datetime.toLocaleString(DateTime.DATE_SHORT)} ${datetime.toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET)}`
}

function format_message (message) {
  return String(message)
    .replaceAll('\r', '\u240D')
    .replaceAll('\n', '\u2424')
}

defineExpose({
  close,
  detail,
  format_date,
  format_message,
  show_stack,
  stack,
})
</script>

<style scoped>
.text {
  font-family: var(--font-monospace), monospace !important;
  white-space: pre-wrap;
}

.log {
  display: flex;
  margin: 0;
  padding: 2px 4px 1px;
  border-bottom: 1px dotted rgba(128,128,128,0.5);
  cursor: pointer;
  transition: all 100ms ease-in-out;
}

.log.event-info:hover {
  color: rgb(var(--v-theme-on-info));
  background: rgb(var(--v-theme-info));
}

.log.event-error:hover {
  color: rgb(var(--v-theme-on-error));
  background: rgb(var(--v-theme-error));
}

.pre {
  display: flex;
  flex-shrink: 0;
  text-align: center;
  justify-content: center;
  vertical-align: center;
  overflow: hidden;
}

.pre.message {
  width: auto;
  flex-shrink: 1;
  text-align: left;
  justify-content: start;
}

.pre.event-info {
  color: rgb(var(--v-theme-info));
}

.log.event-info:hover .pre.event-info {
  color: rgb(var(--v-theme-on-info));
}

.pre.event-error {
  color: rgb(var(--v-theme-error));
}

.log.event-error:hover .pre.event-error {
  color: rgb(var(--v-theme-on-error));
}

.output {
  max-height: 100%;
  align-items: stretch;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
  border-radius: 0;
}
</style>
