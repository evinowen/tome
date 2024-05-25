<template>
  <utility-page
    bottom
    fixed
    :title="repository.branch"
    subtitle="branch"
    :layer="1"
    :open="system.branch"
    :scroll="false"
    @close="close"
  >
    <div
      class="mb-3"
      style="height: 100%; display: flex"
    >
      <v-data-table
        style="flex-grow: 1;"
        density="compact"
        disable-sort
        class="my-0 commit-history"
        :height="0"
        :headers="headers"
        :items="repository.history"
        :hide-default-footer="true"
        :items-per-page="repository.history.length"
      >
        <template #headers />

        <template #item="{ item, index }">
          <div
            class="commit-row px-2"
            @click.stop="diff(item)"
          >
            <div class="commit-icon">
              <v-icon class="branch-icon-dot">
                mdi-circle
              </v-icon>
              <v-icon class="branch-icon">
                mdi-source-commit{{ index > 0 ? ( index === repository.history.length - 1 ? '-end' : '') : '-start' }}
              </v-icon>
            </div>
            <div class="commit-oid mx-2">
              <v-btn
                variant="text"
                color="success"
                style="width: 100%; text-align: center; text-transform: lowercase;"
              >
                <div style="width: 100%; text-align: center; font-weight: bold;">
                  {{ item.oid.substring(0, 7) }}
                </div>
              </v-btn>
            </div>
            <div class="commit-date px-2">
              <div style="margin: 2px 0 -4px">
                {{ format_date_relative(item.date) }}
              </div>
              <small style="opacity: 0.5;">{{ format_date(item.date) }}</small>
            </div>
            <div class="commit-message px-2">
              {{ item.message }}
            </div>
          </div>
        </template>

        <template #bottom />
      </v-data-table>
    </div>
  </utility-page>
</template>

<script lang="ts">
import UtilityPage from '@/components/UtilityPage.vue'
import {
  VBtn,
  VDataTable,
  VIcon,
} from 'vuetify/components'

export default {
  components: {
    UtilityPage,
    VBtn,
    VDataTable,
    VIcon,
  },
}
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { fetchStore } from '@/store'
import { DateTime } from 'luxon'

const store = fetchStore()

const headers = [
  { title: '', value: 'icon', width: '30px' },
  { title: '', value: 'oid', width: '60px' },
  { title: '', value: 'date', width: '120px' },
  { title: 'message', value: 'message', width: '' },
]

const system = computed(() => store.state.system)
const repository = computed(() => store.state.repository)

async function close () {
  await store.dispatch('system/branch', false)
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
})
</script>

<style scoped>
.commit-row {
  display: flex;
  height: 35px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
  margin-top: -1px;
  cursor: pointer;
}

.commit-icon {
  flex-grow: 0;
  width: 30px;
  position: relative;
}

.commit-oid {
  flex-grow: 0;
  width: 60px;
}

.commit-date {
  flex-grow: 0;
  width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.commit-message {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.branch-icon,
.branch-icon-dot {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  color: rgb(var(--v-theme-on-surface));
}

.branch-icon-dot {
  opacity: 0;
  font-size: 14px;
}

.commit-row:hover {
  background: rgba(var(--v-theme-primary), 0.2)
}

.commit-row:hover .branch-icon-dot {
  opacity: 0.5;
}

.branch-icon {
  margin: 0 -8px;
  font-size: 46px;
}

.line {
  width: 100%;
  overflow: wrap;
}

pre {
  display: inline-block;
}

.header-pre {
  display: inline-block;
  vertical-align: bottom;
  color: black;
  line-height: 30px;
  font-size: 0.7em;
  padding-right: 8px;
}
</style>
