<template>
  <div class="search-container">
    <v-toolbar class="search-box">
      <v-item-group
        dense
        multiple
        class="search-buttons"
      >
        <v-btn
          size="small"
          rounded="0"
          :variant="multifile && 'flat'"
          :color="multifile ? 'primary' : ''"
          @click="flag('multifile', !multifile)"
        >
          <v-icon>mdi-file-multiple</v-icon>
        </v-btn>
        <v-btn
          size="small"
          rounded="0"
          :variant="case_sensitive && 'flat'"
          :color="case_sensitive ? 'primary' : ''"
          @click="flag('case_sensitive', !case_sensitive)"
        >
          <v-icon>mdi-format-letter-case</v-icon>
        </v-btn>
        <v-btn
          size="small"
          rounded="0"
          :variant="regex_query && 'flat'"
          :color="regex_query ? 'primary' : ''"
          @click="flag('regex_query', !regex_query)"
        >
          <v-icon>mdi-regex</v-icon>
        </v-btn>
      </v-item-group>
      <v-layout column>
        <v-col class="search-input px-2">
          <v-text-field
            ref="input"
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
        </v-col>
      </v-layout>
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
            <v-layout
              class="search-file"
              @click="select(result.path.absolute, 1, result.matches.length)"
            >
              <v-icon
                size="small"
                class="pr-1"
              >
                {{ result.directory ? 'mdi-folder' : 'mdi-file' }}
              </v-icon>
              <v-col class="grow">
                {{ result.path.relative }}
              </v-col>
              <small>{{ result.path.absolute }}</small>
            </v-layout>
            <v-layout
              v-for="(match, index) in result.matches"
              :key="match.index"
              class="search-result"
              @click="select(result.path.absolute, index + 1, result.matches.length)"
            >
              <v-col class="grow">
                {{ match.line }}
              </v-col>
            </v-layout>
          </div>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Setup, toNative } from 'vue-facing-decorator'
import { VIcon, VTextField, VItemGroup, VBtn, VToolbar, VLayout, VCol, VExpandTransition } from 'vuetify/components'
import { debounce } from 'lodash'
import { Store } from 'vuex'
import { State, fetchStore } from '@/store'

@Component({
  components: { VIcon, VTextField, VItemGroup, VBtn, VToolbar, VLayout, VCol, VExpandTransition }
})
class SearchService extends Vue {
  @Setup(() => fetchStore())
  store!: Store<State>

  get status () {
    return this.store.state.search.status
  }

  get results () {
    return this.store.state.search.results
  }

  get navigation () {
    return this.store.state.search.navigation
  }

  get query () {
    return this.store.state.search.query
  }

  get multifile () {
    return this.store.state.search.multifile
  }

  get regex_query () {
    return this.store.state.search.regex_query
  }

  get case_sensitive () {
    return this.store.state.search.case_sensitive
  }

  get state () {
    const { multifile, regex_query, case_sensitive } = this
    return [multifile, regex_query, case_sensitive]
  }

  get debounce_update () {
    return debounce(this.update, 500)
  }

  @Watch('state')
  state_update () {
    this.debounce_update(this.query)
  }

  async update (query) {
    const path = this.store.state.repository.path
    await this.store.dispatch('search/query', { path, query })
  }

  async next () {
    await this.store.dispatch('search/next')
  }

  async previous () {
    await this.store.dispatch('search/previous')
  }

  async flag (key, value) {
    await this.store.dispatch(`search/${key}`, value)
  }

  async select (path, target = 0, total = 0) {
    await this.store.dispatch('files/select', { path })

    if (target > 0) {
      await this.store.dispatch('search/navigate', { target, total })
    }
  }

  async debounce_clear () {
    return await this.debounce_update('')
  }
}

export default toNative(SearchService)
</script>

<style>
.search-buttons .v-btn {
  min-width: 0px !important;
}

.search-container {
  position: absolute;
  width: 100%;
  bottom: 18px;
  z-index: 99;
}

.search-navigation {
  text-align: center;
}

.search-results {
  height: 120px;
  margin: 12px;
  margin-top: 0px;
  overflow-x: hidden;
  overflow-y: overlay;
  border-top: 1px dotted rgba(0, 0, 0, 0.2);
  box-shadow: 3px 2px 6px 3px rgba(0, 0, 0, 0.2);
  color: var(--v-secondary-lighten5) !important;
  background: var(--v-secondary-base) !important;
}

.search-file {
  padding: 2px 6px 1px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}

.search-result {
  padding: 1px 6px 1px 32px;
  font-size: 0.8em;
  border-bottom: 1px dotted rgba(0, 0, 0, 0.2);
}

.search-file:hover,
.search-result:hover {
  color: var(--v-primary-lighten5) !important;
  background: var(--v-primary-base) !important;
}

.search-file small,
.search-result small {
  font-size: 0.7em;
  padding-top: 3px;
}

.search-file:hover small,
.search-result:hover small {
  font-size: 0.7em;
  color: var(--v-primary-lighten2) !important;
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
  margin: 12px;
  box-shadow: 3px 2px 6px 3px rgba(0, 0, 0, 0.2);
}

.search-input {
  padding: 0 12px;
}

.search-input .v-input__control,
.search-input .v-input__slot,
.search-input .v-text-field__slot {
  height: 28px;
  position: relative;
}

.search-input .v-input__prepend-outer,
.search-input .v-input__append-outer {
  margin-right: 0px !important;
  margin-left: 0px !important;
}
.search-input .v-input__prepend-outer div .v-icon,
.search-input .v-input__append-outer div .v-icon {
  font-size: 2.0em;
}

.search-input input {
  font-size: 6em;
  font-weight: 700;
  padding: 0px 4px;
  max-height: unset;
  height: 120px;
  position: absolute;
  bottom: -18px;
  text-indent: 4px;
  text-shadow:
    -2px -2px 0 var(--v-secondary-base),
    2px -2px 0 var(--v-secondary-base),
    -2px 2px 0 var(--v-secondary-base),
    2px 2px 0 var(--v-secondary-base);
}

</style>
