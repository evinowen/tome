<template>
  <div>
    <utility-page
      bottom
      fixed
      :title="repository.branches.active"
      subtitle="History"
      :layer="1"
      :open="system.history"
      :scroll="false"
      @close="close"
    >
      <div
        ref="list"
        class="history-box"
      >
        <div class="history-list">
          <div
            v-for="item, in repository.history.items"
            :key="item.oid"
            class="history-list-row"
          >
            <div />
            <div class="history-oid">
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
            <div class="history-message px-2">
              <div class="history-message-text">
                {{ item.message }}
              </div>
            </div>
            <div class="history-tag-button px-2">
              <v-btn
                class="pa-2"
                style="min-width: 0"
                size="small"
                variant="flat"
                @click="tag_prompt(true, item.oid)"
              >
                <v-icon>mdi-tag</v-icon>
              </v-btn>
            </div>
            <div class="history-date px-2">
              <div style="margin: 2px 0 -4px">
                {{ format_date_relative(item.date) }}
              </div>
              <small style="opacity: 0.5;">{{ format_date(item.date) }}</small>
            </div>
            <div />
            <div />
            <div class="history-tag-box">
              <div
                v-for="tag_item in tag_list(item.oid)"
                :key="tag_item.name"
                class="history-tag pa-1"
              >
                <v-icon>mdi-tag</v-icon>
                {{ tag_item.name }}
              </div>
            </div>
            <div />
            <div />
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
      <template #actions>
        <div class="d-flex">
          <div class="flex-grow-1">
            <v-btn
              color="primary"
              size="small"
              @click="close"
            >
              Done
            </v-btn>
          </div>
          <v-btn
            class="mr-2"
            color="secondary"
            size="small"
            @click="branches"
          >
            <v-icon class="mr-2">
              mdi-source-branch
            </v-icon>
            Branches
          </v-btn>
          <v-btn
            color="secondary"
            size="small"
            @click="tags"
          >
            <v-icon class="mr-2">
              mdi-tag
            </v-icon>
            Tags
          </v-btn>
        </div>
      </template>
    </utility-page>
    <history-tag-commit
      :visible="store.state.system.history_tag"
      :oid="history_tag_target"
      @close="tag_prompt(false)"
      @create="(name) => tag_create(name, history_tag_target)"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { fetchStore } from '@/store'
import { DateTime } from 'luxon'
import UtilityPage from '@/components/UtilityPage.vue'
import HistoryTagCommit from '@/components/HistoryTagCommit.vue'
import {
  VBtn,
  VIcon,
} from 'vuetify/components'

const store = fetchStore()

const list = ref<HTMLElement>()
const ticker = ref<ReturnType<typeof setTimeout>>()

const system = computed(() => store.state.system)
const repository = computed(() => store.state.repository)

const history_tag_target = ref('')

onMounted(() => {
  ticker.value = setTimeout(scroll, 500)
})

onUnmounted(() => {
  if (ticker.value) {
    clearTimeout(ticker.value)
  }
})

async function branches () {
  await store.dispatch('system/branches', true)
}

async function tags () {
  await store.dispatch('system/tags', true)
}

function tag_list (oid) {
  return store.state.repository.tags.list.filter((tag) => tag.oid === oid)
}

async function tag_prompt (value, oid = '') {
  if (value) {
    history_tag_target.value = oid
  }

  await store.dispatch('system/history_tag', value)
}

async function tag_create (name, oid) {
  await store.dispatch('repository/tags/create', { name, oid })
}

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
  history_tag_target,
  branches,
  close,
  diff,
  format_date_relative,
  format_date,
  page,
  scroll,
  tag_create,
  tag_list,
  tag_prompt,
  tags,
  ticker,
})
</script>

<style scoped>
.history-box {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  height: 0px;
  flex-grow: 1;
  overflow-y: scroll;
}

.history-list {
  display: grid;
  grid-template-columns: auto auto 1fr auto auto;
  gap: 0px;
}

.history-list-row {
  display: contents;
}

.history-load-more {
  display: grid;
  grid-column: span 3;
  grid-row: span 2;
}

.history-icon {
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.history-oid {
  overflow: hidden;
}

.history-message {
  display: flex;
  align-content: center;
  flex-wrap: wrap;
  overflow: hidden;
}

.history-message-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.history-tag-button {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: center;
}

.history-tag-box {
  margin-left: 24px;
}

.history-tag:hover {
  cursor: pointer;
  background: rgba(var(--v-theme-on-surface), 0.2)
}
</style>
