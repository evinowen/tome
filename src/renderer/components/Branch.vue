<template>
  <utility-page
    bottom
    fixed
    :title="repository.branch"
    subtitle="branch"
    :open="value"
    :scroll="false"
    @close="close"
  >
    <div class="mb-3" style="height: 100%; display: flex">
      <v-data-table
        style="flex-grow: 1;"
        fixed-header
        density="compact"
        disable-sort
        class="my-0 commit-history"
        :height="0"
        :headers="headers"
        :items="repository.history"
        :hide-default-footer="true"
        :items-per-page="repository.history.length"
        @click:row="diff"
      >
        <template #item.icon="{ index }">
          <v-icon class="branch-icon-dot">
            mdi-circle
          </v-icon>
          <v-icon class="branch-icon">
            mdi-source-commit{{ index > 0 ? ( index === repository.history.length - 1 ? '-end' : '') : '-start' }}
          </v-icon>
        </template>
        <template #item.oid="{ item }">
          <v-btn
            variant="text"
            color="success"
            style="width: 100%; text-align: center; text-transform: lowercase;"
          >
            <div style="width: 100%; text-align: center; font-weight: bold;">
              {{ item.oid.substring(0, 7) }}
            </div>
          </v-btn>
        </template>
        <template #item.date="{ item }">
          <div class="px-2">
            <div style="margin: 2px 0 -4px">
              {{ format_date_relative(item.date) }}
            </div>
            <small style="opacity: 0.5;">{{ format_date(item.date) }}</small>
          </div>
        </template>
        <template #bottom />
      </v-data-table>
    </div>
  </utility-page>
</template>

<script lang="ts">
import { Component, Prop, Vue, Setup, toNative } from 'vue-facing-decorator'
import {
  VBtn,
  VContainer,
  VDataTable,
  VIcon,
} from 'vuetify/components'
import { DateTime } from 'luxon'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'
import UtilityPage from '@/components/UtilityPage.vue'

@Component({
  components: {
    UtilityPage,
    VBtn,
    VContainer,
    VDataTable,
    VIcon,
  }
})
class Branch extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  @Prop({ default: false })
  value!: boolean

  headers = [
    { title: '', value: 'icon', width: '30px' },
    { title: '', value: 'oid', width: '60px' },
    { title: '', value: 'date', width: '120px' },
    { title: 'message', value: 'message', width: '' }
  ]

  get repository () {
    return this.store.state.repository
  }

  async close () {
    await this.store.dispatch('system/branch', false)
  }

  async diff (commit) {
    await this.store.dispatch('repository/diff', { commit: commit.oid })
    await this.store.dispatch('system/patch', true)
  }

  format_date (date) {
    const datetime = DateTime.fromJSDate(date)
    return `${datetime.toLocaleString(DateTime.DATE_SHORT)} ${datetime.toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET)}`
  }

  format_date_relative (date) {
    const datetime = DateTime.fromJSDate(date)
    return `${datetime.toRelative()}`
  }
}

export default toNative(Branch)
</script>

<style>
.v-data-table.commit-history {
  border-radius: 0
}

.v-data-table.commit-history .v-btn {
  width: 100% !important;
  height: 100% !important;
  text-align: left;
  justify-content: left;
}

.v-data-table.commit-history th {
  height: 1px;
  padding: 0 !important;
}

.v-data-table tr td .v-icon.branch-icon-dot {
  position: absolute;
  float: left;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: black;
  opacity: 0;
  font-size: 14px;
}

.v-data-table tr:hover td .v-icon.branch-icon-dot {
  opacity: 0.5;
}

.v-data-table.commit-history td {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 !important;
  border-radius: 0 !important;
}

.v-data-table.commit-history td:first-child {
  padding: 0 !important;
  border-color: transparent !important;
  overflow: visible;
  position: relative;
}

.v-data-table.commit-history td:first-child .v-btn {
  text-align: center;
  justify-content: center;
}

.v-data-table.commit-history .v-btn .v-icon {
  font-size: 14px !important;
}

.v-icon.branch-icon {
  font-size: 43px !important;
  width: 30px;
  height: 0px;
  color: black;
  opacity: 0.5;
}
</style>

<style scoped>
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
