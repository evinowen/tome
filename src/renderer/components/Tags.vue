<template>
  <div>
    <utility-page
      right
      fixed
      title="Tags"
      :layer="2"
      :open="system.tags"
      :scroll="false"
      @close="close"
    >
      <div
        ref="list"
        class="tags-box"
      >
        <div class="tags-list">
          <div
            v-for="tag in repository_tags.list"
            :key="tag.name"
            class="tags-list-row"
          >
            <div class="tags-cell tag-icon px-2">
              <v-icon>
                mdi-tag
              </v-icon>
            </div>
            <div class="tags-cell-main">
              <div class="mx-2 d-flex flex-column">
                <div
                  class="tag-name"
                >
                  {{ tag.name }}
                </div>
              </div>
            </div>
            <div>
              <v-btn
                rounded="0"
                variant="text"
                color="success"
                style="width: 100%; font-family: monospace;"
                @click.stop="diff(tag.oid)"
              >
                {{ tag.oid.substring(0, 7) }}
              </v-btn>
            </div>
            <div class="tags-cell">
              <v-btn
                class="pa-2"
                style="min-width: 0"
                size="small"
                variant="flat"
                @click="remove_confirm(true, tag.name)"
              >
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </div>
            <div class="tag-date px-2">
              <div style="margin: 2px 0 -4px">
                {{ format_date_relative(tag.date) }}
              </div>
              <small style="opacity: 0.5;">{{ format_date(tag.date) }}</small>
            </div>
            <div class="tags-bar" />
          </div>
        </div>
      </div>
    </utility-page>
    <tags-remove-confirm
      :visible="system.tags_remove_confirm"
      :tag="tag_remove_target"
      @close="remove_confirm(false)"
      @remove="remove(tag_remove_target)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_repository_tags_store } from '@/store/modules/repository/tags'
import { fetch_repository_comparator_store } from '@/store/modules/repository/comparator'
import { DateTime } from 'luxon'
import UtilityPage from '@/components/UtilityPage.vue'
import TagsRemoveConfirm from '@/components/TagsRemoveConfirm.vue'
import {
  VBtn,
  VIcon,
} from 'vuetify/components'

const system = fetch_system_store()
const repository_tags = fetch_repository_tags_store()
const repository_comparator = fetch_repository_comparator_store()

const tag_remove_target = ref('')

async function close () {
  await system.page({ tags: false })
}

async function remove_confirm (value, name = '') {
  if (value) {
    tag_remove_target.value = name
  }

  await system.page({ tags_remove_confirm: value })
}

async function diff (oid) {
  await repository_comparator.diff({ commit: oid })
  await system.page({ patch: true })
}

async function remove (name) {
  await repository_tags.remove(name)
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
  tag_remove_target,
  close,
  diff,
  format_date_relative,
  format_date,
  remove_confirm,
  remove,
})
</script>

<style scoped>
.tags-box {
  outline: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  height: 0px;
  flex-grow: 1;
  overflow-y: scroll;
  background: rgb(var(--v-theme-background));
}

.tags-list {
  background: rgb(var(--v-theme-surface));
  display: grid;
  grid-template-columns: auto 1fr auto auto auto;
  gap: 0px;
}

.tags-list-row {
  display: contents;
}

.tags-bar {
  box-shadow: 0px -1px 0px rgba(var(--v-theme-on-surface), 0.2);
  grid-column: span 5;
  height: 1px;
}

.tags-tag {
  background: rgb(var(--v-theme-primary));
  border-radius: 6px;
  margin: 3px 3px 3px 0px;
  padding: 1px 5px;
}

.tags-cell {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
}

.tags-cell-main {
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-grow: 0;
  flex-direction: column;
  align-content: left;
  justify-content: center;
}

.tags-cell * {
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-name,
.tag-date {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.tag-icon {
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
