<template>
  <div class="search-container pa-2">
    <v-toolbar class="search-box">
      <v-item-group
        dense
        multiple
        class="search-buttons"
      >
        <v-btn
          ref="multifile-button"
          size="small"
          rounded="0"
          :color="multifile ? 'primary' : undefined"
          @click="flag('multifile', !multifile)"
        >
          <v-icon>mdi-file-multiple</v-icon>
        </v-btn>
        <v-btn
          ref="case-sensitive-button"
          size="small"
          rounded="0"
          :color="case_sensitive ? 'primary' : ''"
          @click="flag('case_sensitive', !case_sensitive)"
        >
          <v-icon>mdi-format-letter-case</v-icon>
        </v-btn>
        <v-btn
          ref="regex-query-button"
          size="small"
          rounded="0"
          :color="regex_query ? 'primary' : ''"
          @click="flag('regex_query', !regex_query)"
        >
          <v-icon>mdi-regex</v-icon>
        </v-btn>
      </v-item-group>
      <div class="search-input px-4">
        <v-text-field
          ref="input"
          class="pa-0"
          :model-value="query"
          rows="1"
          :messages="status"
          clearable
          single-line
          hide-details
          :prepend-icon="regex_query ? 'mdi-slash-forward' : undefined"
          :append-icon="regex_query ? 'mdi-slash-forward' : undefined"
          @update:model-value="debounce_update"
          @click:clear="debounce_clear"
          @keydown.enter="next"
          @keydown.esc="$emit('close')"
        />
      </div>
      <div
        v-if="navigation"
        class="search-navigation"
      >
        <v-item-group
          dense
          multiple
          class="search-buttons"
        >
          <v-btn
            size="small"
            rounded="0"
            :disabled="!query"
            @click="previous"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            size="small"
            rounded="0"
            :disabled="!query"
            @click="next"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-item-group>
        <div><small>{{ navigation.total ? navigation.target : '-' }} / {{ navigation.total }}</small></div>
      </div>
    </v-toolbar>
    <v-expand-transition>
      <div v-show="multifile">
        <div class="search-results">
          <div
            v-for="result in results"
            :key="result.path.relative"
          >
            <div
              class="search-file"
              @click="select(result.path.absolute, 1, result.matches.length)"
            >
              <v-icon
                size="small"
                class="pr-1 flex-grow-0"
              >
                {{ result.directory ? 'mdi-folder' : 'mdi-file' }}
              </v-icon>
              <div class="flex-grow-1 pl-2">
                {{ result.path.relative }}
              </div>
              <div class="flex-grow-1 text-end pr-3">
                <small>{{ result.path.absolute }}</small>
              </div>
            </div>
            <v-layout
              v-for="(match, index) in result.matches"
              :key="match.index"
              class="search-result"
              @click="select(result.path.absolute, index + 1, result.matches.length)"
            >
              <div class="grow">
                {{ match.line }}
              </div>
            </v-layout>
          </div>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import {
  VBtn,
  VExpandTransition,
  VIcon,
  VItemGroup,
  VLayout,
  VTextField,
  VToolbar,
} from 'vuetify/components'

export default {
  components: {
    VBtn,
    VExpandTransition,
    VIcon,
    VItemGroup,
    VLayout,
    VTextField,
    VToolbar,
  },
}
</script>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { debounce } from 'lodash'
import { fetchStore } from '@/store'

const store = fetchStore()

const status = computed(() => {
  return store.state.search.status
})

const results = computed(() => {
  return store.state.search.results
})

const navigation = computed(() => {
  return store.state.search.navigation
})

const query = computed(() => {
  return store.state.search.query
})

const multifile = computed(() => {
  return store.state.search.multifile
})

const regex_query = computed(() => {
  return store.state.search.regex_query
})

const case_sensitive = computed(() => {
  return store.state.search.case_sensitive
})

const state = computed(() => {
  return [ multifile.value, regex_query.value, case_sensitive.value ]
})

watch(state, () => {
  debounce_update(query.value)
})

async function update (query) {
  const path = store.state.repository.path
  await store.dispatch('search/query', { path, query })
}

const debounce_update = debounce(update, 500)

async function next () {
  await store.dispatch('search/next')
}

async function previous () {
  await store.dispatch('search/previous')
}

async function flag (key, value) {
  await store.dispatch(`search/${key}`, value)
}

async function select (path, target = 0, total = 0) {
  await store.dispatch('files/select', { path })

  if (target > 0) {
    await store.dispatch('search/navigate', { target, total })
  }
}

async function debounce_clear () {
  return await debounce_update('')
}

defineExpose({
  next,
  previous,
  select,
  update,
})
</script>

<style scoped>

.search-buttons :deep(.v-btn) {
  min-width: 0px;
}

.search-container {
  position: absolute;
  width: 100%;
  bottom: 0;
  z-index: 99;
}

.search-navigation {
  text-align: center;
}

.search-results {
  height: 120px;
  overflow-x: hidden;
  overflow-y: overlay;
  border-top: 1px dotted rgba(0, 0, 0, 0.2);
  box-shadow: 3px 2px 6px 3px rgba(0, 0, 0, 0.2);
  color: rgb(var(--v-theme-on-surface));
  background: rgba(var(--v-theme-surface), 0.9);
}

.search-file {
  padding: 2px 6px 1px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  display: flex;
}

.search-result {
  padding: 1px 6px 1px 32px;
  font-size: 0.8em;
  border-bottom: 1px dotted rgba(0, 0, 0, 0.2);
}

.search-file:hover,
.search-result:hover {
  color: rgb(var(--v-theme-on-primary));
  background: rgba(var(--v-theme-primary), 0.9);
}

.search-file small,
.search-result small {
  font-size: 0.7em;
  padding-top: 3px;
}

.search-score {
  float: right;
  width: 36px;
  border-radius: 6px;
  margin: 1px;
  font-size: 0.8em;
  text-align: center;
  font-weight: bold;
}

.search-box {
  overflow: visible;
  padding: 0 12px;
  box-shadow: 3px 2px 6px 3px rgba(0, 0, 0, 0.2);
}

.search-input {
  flex-grow: 1;
}

.search-input :deep(*) {
  overflow-y: visible;
}

.search-input :deep(.v-input__control),
.search-input :deep(.v-input__slot),
.search-input :deep(.v-text-field__slot) {
  height: 28px;
  position: relative;
  overflow: visible;
}

.search-input :deep(input.v-field__input) {
  font-size: 6em;
  font-weight: 700;
  padding: 0px 4px;
  max-height: unset;
  height: 120px;
  position: absolute;
  bottom: -18px;
  text-indent: 4px;
  padding-top: 0px;
  padding-bottom: 0px;
}
</style>
