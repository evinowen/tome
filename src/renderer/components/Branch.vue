<template>
  <v-navigation-drawer
    :value="value"
    fixed
    right
    stateless
    width="100%"
    style="z-index: 110; max-width: 900px; height: auto; top: 25px; bottom: 18px;"
    @input="$event || close"
  >
    <v-container
      fluid
      class="pb-0"
      style="height: 100%;"
    >
      <div
        class="d-flex flex-column align-stretch flex-grow-0"
        style="height: 100%;"
      >
        <div class="flex-grow-0">
          <div>
            <v-btn
              tile
              icon
              class="float-right"
              color="black"
              @click.stop="close"
            >
              <v-icon>mdi-window-close</v-icon>
            </v-btn>
            <h1>Branch</h1>
          </div>
          <div style="clear: both" />
        </div>

        <div class="flex-grow-1 mb-3">
          <v-data-table
            dense
            disable-sort
            class="my-0 commit-history"
            :headers="headers"
            :items="repository.history"
            :hide-default-footer="true"
            :items-per-page="repository.history.length"
            @click:row="diff"
          >
            <template #item.oid="{ item }">
              <v-btn
                tile
                icon
                x-small
                color="success"
              >
                {{ item.oid.substring(0, 7) }}
              </v-btn>
            </template>
            <template #item.date="{ item }">
              {{ format_date(item.date) }}
            </template>
          </v-data-table>
        </div>

        <div
          ref="base"
          class="flex-grow-0 pb-3 actions"
        >
          <v-divider class="mt-0 mb-2" />
          <v-btn
            small
            color="primary"
            @click.stop="close"
          >
            Done
          </v-btn>
        </div>
      </div>
    </v-container>
  </v-navigation-drawer>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { VNavigationDrawer, VContainer, VBtn, VIcon, VDataTable, VDivider } from 'vuetify/lib'
import { DateTime } from 'luxon'
import store from '@/store'

export const BranchProperties = Vue.extend({
  props: {
    value: { type: Boolean, default: false }
  }
})

@Component({
  components: { VNavigationDrawer, VContainer, VBtn, VIcon, VDataTable, VDivider }
})
export default class Branch extends BranchProperties {
  headers = [
    { text: '', value: 'oid', width: '60px' },
    { text: 'date', value: 'date', width: '180px' },
    { text: 'message', value: 'message', width: '' }
  ]

  get repository () {
    return store.state.repository
  }

  async close () {
    await store.dispatch('system/branch', false)
  }

  async diff (commit) {
    await store.dispatch('repository/diff', { commit: commit.oid })
    await store.dispatch('system/patch', true)
  }

  format_date (date) {
    const datetime = DateTime.fromJSDate(date)
    return `${datetime.toLocaleString(DateTime.DATE_SHORT)} ${datetime.toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET)}`
  }
}
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
}

.v-data-table.commit-history td {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 8px !important;
}

.v-data-table.commit-history td:first-child {
  padding: 0px !important;
}

.v-data-table.commit-history td:first-child .v-btn {
  text-align: center;
  justify-content: center;
}

.v-data-table.commit-history .v-btn .v-icon {
  font-size: 14px !important;
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

.actions {
  backdrop-filter: blur(2px);
  position: sticky;
  bottom: 0px
}
</style>
