<template>
  <v-navigation-drawer :value=value @input="$emit('input', $event)" fixed right stateless width="100%" style="z-index: 110; height: auto; top: 25px; bottom: 18px;">
    <v-container fluid class="pb-0" style="height: 100%;">
      <div class="d-flex flex-column align-stretch flex-grow-0" style="height: 100%;">
        <div class="flex-grow-0">
          <div>
            <v-btn tile icon class="float-right" color="black" @click.stop="$emit('close')">
              <v-icon>mdi-window-close</v-icon>
            </v-btn>
            <h1>Branch</h1>
          </div>
          <div style="clear: both" ></div>
        </div>

        <div class="flex-grow-1">
          <v-data-table
            dense disable-sort class="my-0 commit-history"
            :headers=headers
            :items=history
            :hide-default-footer="true"
            :items-per-page="history.length"
            @click:row=diff
          >
            <template v-slot:item.oid="{ item }">
              <v-btn tile icon x-small color="success">
                {{ item.oid.substring(0, 7) }}
              </v-btn>
            </template>
            <template v-slot:item.date="{ item }">
              {{ String(item.date.getMonth()) }} / {{ String(item.date.getDay()) }} / {{ String(item.date.getFullYear()) }}
              {{ String(item.date.getHours()) }}:{{ String(item.date.getMinutes()).padStart(2, '0') }}:{{ String(item.date.getSeconds()).padStart(2, '0') }}
            </template>
          </v-data-table>
        </div>

        <div ref="base" class="flex-grow-0 pb-3">
          <v-divider class="mt-4 mb-2"></v-divider>
          <v-btn color="primary" @click.stop="$emit('close')">
            <v-icon class="mr-2">mdi-cancel</v-icon>
            Done
          </v-btn>
        </div>
      </div>
    </v-container>
  </v-navigation-drawer>
</template>

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
</style>

<script>
import store from '@/store'

export default {
  props: {
    value: { type: Boolean, default: false }
  },
  data: () => ({
    headers: [
      { text: '', value: 'oid', width: '60px' },
      { text: 'date', value: 'date', width: '' },
      { text: 'message', value: 'message', width: '' }
    ]
  }),
  computed: {
    history: function () {
      return store.state.tome.history
    }
  },
  methods: {
    diff: async function (commit) {
      await store.dispatch('tome/diff', { commit: commit.oid })

      this.$emit('patch')
    }
  }
}
</script>
