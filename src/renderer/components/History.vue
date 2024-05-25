<template>
  <utility-page
    bottom
    fixed
    :title="repository.branch"
    subtitle="History"
    :layer="1"
    :open="system.history"
    :scroll="false"
    @close="close"
  >
    <div
      ref="list"
      class="commit-box"
    >
      <div class="commit-list">
        <div
          v-for="(item, index) in repository.history.items"
          :key="item.oid"
          class="commit-list-row"
        >
          <div style="overflow: none;">
            <div class="commit-icon">
              <v-icon style="height: 32px; font-size: 48px; line-height: 36px;">
                mdi-source-commit{{ index > 0 ? ( item.root ? '-end' : '') : '-start' }}
              </v-icon>
            </div>
          </div>
          <div class="column-oid">
            <v-btn
              rounded="0"
              variant="text"
              color="success"
              style="width: 100%; font-family: monospace;"
              @click.stop="diff(item)"
            >
              {{ item.oid.substring(0, 7) }}
            </v-btn>
          </div>
          <div class="column-message px-2">
            <div class="column-message-text">
              {{ item.message }}
            </div>
          </div>
          <div class="commit-date px-2">
            <div style="margin: 2px 0 -4px">
              {{ format_date_relative(item.date) }}
            </div>
            <small style="opacity: 0.5;">{{ format_date(item.date) }}</small>
          </div>
        </div>
      </div>
      <div class="d-flex justify-center align-center">
        <v-btn
          v-if="!repository.history.rooted"
          class="ma-3"
          :loading="repository.history.paging"
          @click="page"
        >
          Load More
        </v-btn>
      </div>
    </div>
  </utility-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { fetchStore } from '@/store'
import { DateTime } from 'luxon'
import UtilityPage from '@/components/UtilityPage.vue'
import {
  VBtn,
  VIcon,
} from 'vuetify/components'

const store = fetchStore()

const list = ref<HTMLElement>()
const ticker = ref<ReturnType<typeof setTimeout>>()

const system = computed(() => store.state.system)
const repository = computed(() => store.state.repository)

onMounted(() => {
  ticker.value = setTimeout(scroll, 500)
})

onUnmounted(() => {
  if (ticker.value) {
    clearTimeout(ticker.value)
  }
})

async function close () {
  await store.dispatch('system/history', false)
}

async function scroll (event?: Event) {
  if (store.state.repository.history.loaded) {
    if (store.state.repository.history.rooted) {
      return
    }

    if (list.value.scrollHeight - list.value.scrollTop - list.value.clientHeight < 1) {
      await page()
    }
  }

  ticker.value = setTimeout(scroll, 500)
}

async function page () {
  await store.dispatch('repository/history/page')
}

async function diff (commit) {
  await store.dispatch('repository/comparator/diff', { commit: commit.oid })
  await store.dispatch('system/patch', true)
}

function format_date (date) {
  const datetime = DateTime.fromJSDate(date)
  return `${datetime.toLocaleString(DateTime.DATE_SHORT)} ${datetime.toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET)}`
}

function format_date_relative (date) {
  const datetime = DateTime.fromJSDate(date)
  return `${datetime.toRelative()}`
}

defineExpose({
  close,
  diff,
  format_date,
  format_date_relative,
  page,
  scroll,
  ticker,
})
</script>

<style scoped>
.commit-box {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  height: 0px;
  flex-grow: 1;
  overflow-y: scroll;
}

.commit-list {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 0px;
}

.commit-list-row {
  display: contents;
}

.commit-load-more {
  display: grid;
  grid-column: span 3;
  grid-row: span 2;
}

.commit-icon {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.column-oid {
  overflow: hidden;
}

.column-message {
  display: flex;
  align-content: center;
  flex-wrap: wrap;
  overflow: hidden;
}

.column-message-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
