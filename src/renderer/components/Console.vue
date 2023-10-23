<template>
  <div id="console">
    <v-dialog
      v-model="detail"
      :scrim="false"
    >
      <v-card>
        <v-card-text style="font-family: monospace; white-space: pre-wrap;">
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
    <slot />
    <v-bottom-sheet
      :scrim="false"
      contained
      attach="#console"
      scrollable
      persistent
      hide-overlay
      no-click-animation
      internal-activator
      :model-value="value"
      offset="100px"
      @input="$event || close()"
    >
      <v-card>
        <v-btn
          rounded="0"
          class="pa-0"
          style="height: 16px; width: 100%"
          color="accent"
          @click.stop="close"
        >
          <v-icon size="small">
            mdi-chevron-down
          </v-icon>
        </v-btn>
        <div class="output">
          <div
            v-for="(event, index) in events.slice().reverse()"
            :key="index"
            :class="['log', `event-${event.type}`]"
            @click.stop="() => { show_stack(event.stack || event.message) }"
          >
            <pre class="pre datetime">{{ format_date(event.datetime) }}</pre>
            <pre :class="['pre', `event-${event.type}`, 'px-2']">{{ event.type.padEnd(6) }}</pre>
            <pre class="pre message">{{ format_message(event.message) }}</pre>
          </div>
        </div>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Setup, toNative } from 'vue-facing-decorator'
import { DateTime } from 'luxon'
import { VDialog, VIcon, VBtn, VCard, VCardText, VCardActions } from 'vuetify/components'
import { VBottomSheet } from 'vuetify/labs/VBottomSheet'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'

@Component({
  components: { VDialog, VIcon, VBtn, VCard, VCardText, VCardActions, VBottomSheet }
})
class Console extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  @Prop({ default: false })
  value!: boolean

  detail = false
  stack = ''

  get events () {
    return this.store.state.events
  }

  async close () {
    await this.store.dispatch('system/console', false)
  }

  show_stack (stack) {
    this.stack = stack.trim()

    if (this.stack) {
      this.detail = true
    }
  }

  format_date (datetime) {
    return `${datetime.toLocaleString(DateTime.DATE_SHORT)} ${datetime.toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET)}`
  }

  format_message (message) {
    return String(message)
      .replace(/\r/g, '\u240D')
      .replace(/\n/g, '\u2424')
  }
}

export default toNative(Console)
</script>

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
  color: var(--v-info-base);
}

.pre.event-error {
  color: var(--v-error-base);
}

.output {
  max-height: 100%;
  align-items: stretch;
  overflow: auto;
  display: flex;
  flex-direction: column-reverse;
  border-radius: 0 !important;
}

#console {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
</style>
