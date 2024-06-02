<template>
  <div>
    <utility-page
      right
      fixed
      title="Branches"
      :layer="2"
      :open="system.branches"
      :scroll="false"
      @close="close"
    >
      <div
        ref="list"
        class="branches-box"
      >
        <div class="branches-list">
          <div
            v-for="branch in repository_branches.list"
            :key="branch.name"
            class="branches-list-row"
          >
            <div class="branches-cell branch-icon px-2">
              <v-icon v-if="branch.name === repository_branches.active">
                mdi-star
              </v-icon>
            </div>
            <div class="branches-cell-main">
              <div class="mx-2 d-flex flex-column">
                <branches-name-edit-label
                  :visible="branch.name === branch_rename_target"
                  :value="branch.name"
                  @update="(value) => rename(branch.name, value)"
                />
                <div
                  v-show="branch.name !== branch_rename_target"
                  class="branch-name"
                >
                  {{ branch.name }}
                </div>
              </div>
            </div>
            <div class="branches-cell">
              <v-btn
                class="pa-2 mr-1"
                style="min-width: 0"
                size="small"
                variant="flat"
                @click="copy(branch.name)"
              >
                <v-icon>mdi-content-copy</v-icon>
              </v-btn>
              <v-btn
                class="pa-2 mr-1"
                style="min-width: 0"
                size="small"
                variant="flat"
                @click="rename_show(branch.name)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                class="pa-2"
                style="min-width: 0"
                size="small"
                variant="flat"
                :disabled="branch.name === repository_branches.active"
                @click="remove_confirm(true, branch.name)"
              >
                <v-icon>mdi-trash-can</v-icon>
              </v-btn>
            </div>
            <div class="branch-date px-2">
              <div style="margin: 2px 0 -4px">
                {{ format_date_relative(branch.updated) }}
              </div>
              <small style="opacity: 0.5;">{{ format_date(branch.updated) }}</small>
            </div>
            <div class="branches-cell">
              <v-btn
                :disabled="branch.name === repository_branches.active"
                class="ma-1"
                size="small"
                @click="select(branch.name)"
              >
                Select
              </v-btn>
              <v-btn
                :disabled="branch.name !== repository_branches.active"
                class="ma-1"
                size="small"
                @click="create_show(branch.name)"
              >
                Branch
              </v-btn>
            </div>
            <div class="branches-bar" />
          </div>
          <div
            v-show="branch_create_target !== ''"
            class="branches-list-row"
          >
            <div class="branches-cell" />
            <div class="branches-cell-main">
              <div class="mx-2 d-flex flex-column">
                <branches-name-edit-label
                  :visible="branch_create_target !== ''"
                  :value="branch_create_name"
                  @update="(value) => create(value)"
                />
              </div>
            </div>
            <div class="branches-cell" />
            <div class="branches-cell" />
            <div class="branches-cell">
              <v-btn
                disabled
                class="ma-1"
                size="small"
              >
                Select
              </v-btn>
              <v-btn
                disabled
                class="ma-1"
                size="small"
              >
                Branch
              </v-btn>
            </div>
            <div class="branches-bar" />
          </div>
        </div>
      </div>
    </utility-page>
    <branches-remove-confirm
      :visible="system.branches_remove_confirm"
      :branch="branch_remove_target"
      @close="remove_confirm(false)"
      @remove="remove(branch_remove_target)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { fetch_clipboard_store } from '@/store/modules/clipboard'
import { fetch_system_store } from '@/store/modules/system'
import { fetch_repository_branches_store } from '@/store/modules/repository/branches'
import { DateTime } from 'luxon'
import UtilityPage from '@/components/UtilityPage.vue'
import BranchesNameEditLabel from '@/components/BranchesNameEditLabel.vue'
import BranchesRemoveConfirm from '@/components/BranchesRemoveConfirm.vue'
import {
  VBtn,
  VIcon,
} from 'vuetify/components'

const system = fetch_system_store()
const clipboard = fetch_clipboard_store()
const repository_branches = fetch_repository_branches_store()

const branch_remove_target = ref('')
const branch_rename_target = ref('')

const branch_create_target = ref('')
const branch_create_name = ref('')

async function close () {
  await system.page({ branches: false })
}

async function copy (name) {
  await clipboard.text(name)
}

async function create_show (name) {
  branch_create_name.value = ''
  branch_create_target.value = name
}

async function create (name) {
  branch_create_target.value = ''
  await repository_branches.create(name)
}

async function rename_show (name) {
  branch_rename_target.value = name
}

async function rename (name, value) {
  branch_rename_target.value = undefined
  await repository_branches.rename({ name, value })
}

async function select (name) {
  await repository_branches.select(name)
}

async function remove_confirm (value, name = '') {
  if (value) {
    branch_remove_target.value = name
  }

  await system.page({ branches_remove_confirm: value })
}

async function remove (name) {
  await repository_branches.remove(name)
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
  branch_create_name,
  branch_create_target,
  branch_remove_target,
  branch_rename_target,
  close,
  copy,
  create_show,
  create,
  format_date_relative,
  format_date,
  remove_confirm,
  remove,
  rename_show,
  rename,
  select,
})
</script>

<style scoped>
.branches-box {
  outline: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  height: 0px;
  flex-grow: 1;
  overflow-y: scroll;
  background: rgb(var(--v-theme-background));
}

.branches-list {
  background: rgb(var(--v-theme-surface));
  display: grid;
  grid-template-columns: auto 1fr auto auto auto;
  gap: 0px;
}

.branches-list-row {
  display: contents;
}

.branches-bar {
  box-shadow: 0px -1px 0px rgba(var(--v-theme-on-surface), 0.2);
  grid-column: span 5;
  height: 1px;
}

.branches-tag {
  background: rgb(var(--v-theme-primary));
  border-radius: 6px;
  margin: 3px 3px 3px 0px;
  padding: 1px 5px;
}

.branches-cell {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
}

.branches-cell-main {
  height: 100%;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-grow: 0;
  flex-direction: column;
  align-content: left;
  justify-content: center;
}

.branches-cell * {
  overflow: hidden;
  text-overflow: ellipsis;
}

.branch-name,
.branch-date {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.branch-icon {
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>
