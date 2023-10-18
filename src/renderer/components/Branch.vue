<template>
  <v-navigation-drawer
    :model-value="value"
    width="900"
    location="right"
    @update:model-value="$event || close"
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
              rounded="0"
              icon
              class="float-right"
              color="black"
              @click.stop="close"
            >
              <v-icon>mdi-window-close</v-icon>
            </v-btn>
            <h1><span class="header-pre float-left">branch</span>{{ repository.branch }}</h1>
          </div>
          <div style="clear: both" />
        </div>

        <div class="flex-grow-1 mb-3">
          <!-- <v-data-table
            dense
            disable-sort
            class="my-0 commit-history"
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
                rounded="0"
                icon
                x-small
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
          </v-data-table> -->
        </div>

        <div
          ref="base"
          class="flex-grow-0 pb-3 actions"
        >
          <v-divider class="mt-0 mb-2" />
          <v-btn
            size="small"
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
import { Component, Prop, Vue, Setup, toNative } from 'vue-facing-decorator'
import { VNavigationDrawer, VContainer, VBtn, VIcon, VDivider } from 'vuetify/components'
import { DateTime } from 'luxon'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'

@Component({
  components: { VNavigationDrawer, VContainer, VBtn, VIcon, VDivider }
})
class Branch extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  @Prop({ default: false })
  value!: boolean

  headers = [
    { text: '', value: 'icon', width: '30px' },
    { text: '', value: 'oid', width: '60px' },
    { text: '', value: 'date', width: '120px' },
    { text: 'message', value: 'message', width: '' }
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

.actions {
  backdrop-filter: blur(2px);
  position: sticky;
  bottom: 0px
}
</style>
