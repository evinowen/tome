<template>
  <div class="search-container pa-2">
    <v-toolbar
      class="search-box"
      color="surface"
      :style="{ opacity: search_opacity / 100.0 }"
    >
      <v-item-group
        dense
        multiple
        class="search-buttons"
      >
        <v-btn
          ref="multifile-button"
          size="small"
          rounded="0"
          :color="search.multifile ? 'primary' : undefined"
          @click="flag('multifile', !search.multifile)"
        >
          <v-icon>mdi-file-multiple</v-icon>
        </v-btn>
        <v-btn
          ref="case-sensitive-button"
          size="small"
          rounded="0"
          :color="search.case_sensitive ? 'primary' : ''"
          @click="flag('case_sensitive', !search.case_sensitive)"
        >
          <v-icon>mdi-format-letter-case</v-icon>
        </v-btn>
        <v-btn
          ref="regex-query-button"
          size="small"
          rounded="0"
          :color="search.regex_query ? 'primary' : ''"
          @click="flag('regex_query', !search.regex_query)"
        >
          <v-icon>mdi-regex</v-icon>
        </v-btn>
      </v-item-group>
      <div class="search-input px-4">
        <v-text-field
          ref="input"
          class="pa-0"
          :model-value="search.query"
          rows="1"
          :messages="search.status"
          clearable
          single-line
          hide-details
          :prepend-icon="search.regex_query ? 'mdi-slash-forward' : undefined"
          :append-icon="search.regex_query ? 'mdi-slash-forward' : undefined"
          @update:model-value="debounce_update"
          @click:clear="debounce_clear"
          @keydown.enter="next"
          @keydown.esc="$emit('close')"
        />
      </div>
      <div
        v-if="search.navigation"
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
            :disabled="!search.query"
            @click="previous"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            size="small"
            rounded="0"
            :disabled="!search.query"
            @click="next"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-item-group>
        <div><small>{{ search.navigation.total ? search.navigation.target : '-' }} / {{ search.navigation.total }}</small></div>
      </div>
    </v-toolbar>
    <v-expand-transition>
      <div
        v-show="search.multifile"
        class="search-results-box"
        :style="{ opacity: search_opacity / 100.0 }"
      >
        <div
          ref="resizer"
          class="search-size-control"
          :style="{ height: `${search_resize_height}px` }"
          @pointerdown="resize_start"
          @pointermove="throttle_resize_move"
          @pointerup="resize_end"
        />
        <div
          ref="resized"
          class="search-results"
          :style="{ height: `${height}px` }"
        >
          <div
            v-for="result in search.results"
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
import { computed, ref, watch } from 'vue'
import { debounce, throttle } from 'lodash'
import { fetch_configuration_store } from '@/store/modules/configuration'
import { fetch_files_store } from '@/store/modules/files'
import { fetch_repository_store } from '@/store/modules/repository'
import { fetch_search_store } from '@/store/modules/search'

const configuration = fetch_configuration_store()
const files = fetch_files_store()
const repository = fetch_repository_store()
const search = fetch_search_store()

const state = computed(() => {
  return [ search.multifile, search.regex_query, search.case_sensitive ]
})

watch(state, () => {
  debounce_update(search.query)
})

async function update (query) {
  const path = repository.path
  await search.execute({ path, query })
}

const debounce_update = debounce(update, 500)

async function next () {
  await search.next()
}

async function previous () {
  await search.previous()
}

async function flag (key, value) {
  await search.flags({ [key]: value })
}

async function select (path, target = 0, total = 0) {
  await files.select({ path })

  if (target > 0) {
    await search.navigate({ target, total })
  }
}

async function debounce_clear () {
  return await debounce_update('')
}

const search_height = computed(() => configuration.active.search_height)
const search_resize_height = computed(() => configuration.active.search_resize_height)
const search_opacity = computed(() => configuration.active.search_opacity)

const resized = ref<HTMLElement>()
const resizer = ref<HTMLElement>()
const resizing = ref<Boolean>(false)
const height = ref<number>(search_height.value)
const origin = ref<number>(0)

watch(search_height, (value) => height.value = value)

async function resize_start (event: PointerEvent) {
  resizer.value.setPointerCapture(event.pointerId)
  event.preventDefault()
  resizing.value = true
  height.value = resized.value.offsetHeight
  origin.value = event.pageY + height.value
}

const throttle_resize_move = throttle(resize_move, 25)
function resize_move (event) {
  if (!resizing.value) {
    return
  }

  height.value = origin.value - event.pageY
}

function resize_end (event: PointerEvent) {
  resizing.value = false
  resizer.value.releasePointerCapture(event.pointerId)

  configuration.update(configuration.target, { search_height: height.value })
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

.search-results-box {
  transition: all 0.5s ease-out allow-discrete;
  background: rgba(var(--v-theme-surface), 0.9);
  border-top: 1px dotted rgba(0, 0, 0, 0.2);
  box-shadow: 3px 2px 6px 3px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

.search-results {
  height: 120px;
  overflow-x: hidden;
  overflow-y: overlay;
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

.search-size-control {
  cursor: ns-resize;
  background: rgba(var(--v-theme-on-surface), 0.3);
}
</style>
