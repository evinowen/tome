<template>
  <div>
    <console-page
      :layer="8"
      :open="system.console"
      @close="close"
    >
      <div class="output">
        <div
          v-for="(event, index) in events.slice().reverse()"
          :key="index"
          :class="['log', `event-${event.level}`]"
          @click.stop="() => show_detail(event)"
        >
          <pre class="pre datetime">{{ format_date(event.datetime) }}</pre>
          <pre :class="['pre', `event-${event.level}`, 'px-2']">{{ (event.level || 'unknown').padEnd(6) }}</pre>
          <pre class="pre message">{{ format_message(event.message) }}</pre>
        </div>
      </div>
    </console-page>
    <console-detail-box
      :visible="detail"
      :level="level"
      :message="message"
      :stack="stack || ''"
      @done="detail = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { DateTime } from 'luxon'
import { fetch_log_store } from '@/store/modules/log'
import { fetch_system_store } from '@/store/modules/system'
import ConsolePage from './ConsolePage.vue'
import ConsoleDetailBox from './ConsoleDetailBox.vue'

const log = fetch_log_store()
const system = fetch_system_store()

const detail = ref(false)
const level = ref('')
const message = ref('')
const stack = ref('')

const events = computed(() => log.events)

async function close () {
  await system.page({ console: false })
}

function show_detail (event) {
  level.value = String(event.level).trim()
  message.value = String(event.message).trim()
  stack.value = String(event.stack).trim()

  detail.value = true
}

function format_date (datetime) {
  return `${datetime.toLocaleString(DateTime.DATE_SHORT)} ${datetime.toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET)}`
}

function format_message (message) {
  return String(message)
    .replaceAll('\r', '\u240D')
    .replaceAll('\n', '\u2424')
}

watchEffect(() => {
  if (!system.console) {
    detail.value = false
  }
})

defineExpose({
  close,
  detail,
  format_date,
  format_message,
  show_detail,
  level,
  message,
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

.log.event-trace:hover {
  color: rgb(var(--v-theme-on-background));
  background: rgb(var(--v-theme-background));
}

.log.event-debug:hover {
  color: rgb(var(--v-theme-on-success));
  background: rgb(var(--v-theme-success));
}

.log.event-info:hover {
  color: rgb(var(--v-theme-on-info));
  background: rgb(var(--v-theme-info));
}

.log.event-warn:hover {
  color: rgb(var(--v-theme-on-warning));
  background: rgb(var(--v-theme-warning));
}

.log.event-error:hover {
  color: rgb(var(--v-theme-on-error));
  background: rgb(var(--v-theme-error));
}

.log.event-fatal:hover {
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

.pre.event-trace {
  color: rgb(var(--v-theme-on-background));
}

.log.event-trace:hover .pre.event-trace {
  color: rgb(var(--v-theme-on-background));
}

.pre.event-debug {
  color: rgb(var(--v-theme-success));
}

.log.event-debug:hover .pre.event-debug {
  color: rgb(var(--v-theme-on-success));
}

.pre.event-info {
  color: rgb(var(--v-theme-info));
}

.log.event-info:hover .pre.event-info {
  color: rgb(var(--v-theme-on-info));
}

.pre.event-warn {
  color: rgb(var(--v-theme-warning));
}

.log.event-warn:hover .pre.event-warn {
  color: rgb(var(--v-theme-on-warning));
}

.pre.event-error {
  color: rgb(var(--v-theme-error));
}

.log.event-error:hover .pre.event-error {
  color: rgb(var(--v-theme-on-error));
}

.pre.event-fatal {
  color: rgb(var(--v-theme-error));
}

.log.event-fatal:hover .pre.event-fatal {
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
