<template>
  <div class="search-container">
    <v-toolbar class="search-box">
      <v-item-group dense multiple class="search-buttons">
        <v-btn small tile :depressed=multifile @click="flag('multifile', !multifile)" :color="multifile ? 'primary' : ''">
          <v-icon>mdi-file-multiple</v-icon>
        </v-btn>
        <v-btn small tile :depressed=case_sensitive  @click="flag('case_sensitive', !case_sensitive)" :color="case_sensitive ? 'primary' : ''">
          <v-icon>mdi-format-letter-case</v-icon>
        </v-btn>
        <v-btn small tile :depressed=regex_query @click="flag('regex_query', !regex_query)" :color="regex_query ? 'primary' : ''">
          <v-icon>mdi-regex</v-icon>
        </v-btn>
      </v-item-group>
      <v-text-field
        ref="input" class="search-input"
        :value=query
        @input=debounce_update
        @click:clear=debounce_clear
        @keydown.enter=next
        @keydown.esc="$emit('close')"
        rows=1
        :messages=status
        clearable
      />
      <div class="search-navigation" v-if=navigation>
        <v-item-group dense multiple class="search-buttons">
          <v-btn small tile @click=previous :disabled=!query><v-icon>mdi-chevron-left</v-icon></v-btn>
          <v-btn small tile @click=next :disabled=!query><v-icon>mdi-chevron-right</v-icon></v-btn>
        </v-item-group>
        <div><small>{{ navigation.total ? navigation.target : '-' }} / {{ navigation.total }}</small></div>
      </div>
    </v-toolbar>
    <v-expand-transition>
      <div v-show=multifile>
        <div class="search-results" v-if=results>
          <div v-for="result in results" :key="result.path.relative">
            <v-layout
              class="search-file"
              @click="select(result.path.absolute, 1, result.matches.length)"
            >
              <v-icon small class="pr-1">{{ result.directory ? 'mdi-folder' : 'mdi-file' }}</v-icon>
              <v-flex grow>{{ result.path.relative }}</v-flex>
              <small>{{ result.path.absolute }}</small>
            </v-layout>
            <v-layout
              v-for="(match, index) in result.matches" :key="match.index"
              class="search-result"
              @click="select(result.path.absolute, index + 1, result.matches.length)"
            >
              <v-flex grow>{{ match.line }}</v-flex>
            </v-layout>
          </div>
        </div>
        <div class="search-empty" v-else>ಠ_ಠ</div>
      </div>
    </v-expand-transition>
  </div>
</template>

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
  overflow-x: hidden;
  overflow-y: scroll;
  border-top: 1px dotted rgba(0, 0, 0, 0.2);
  box-shadow: 3px 2px 6px 3px rgba(0, 0, 0, 0.2);
  color: var(--v-secondary-lighten5) !important;
  background: var(--v-secondary-base) !important;
}

.search-empty {
  height: 100px;
  margin: 12px;
  border-top: 1px dotted rgba(0, 0, 0, 0.2);
  box-shadow: 3px 2px 6px 3px rgba(0, 0, 0, 0.2);
  padding: 20px;
  font-size: 4em;
  text-align: center;
  color: rgba(0, 0, 0, 0.2);
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
.search-result small{
  font-size: 0.7em;
  padding-top: 3px;
}

.search-file:hover small,
.search-result:hover small{
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
  height: 100%;
}

.search-input .v-input__control,
.search-input .v-input__slot,
.search-input .v-text-field__slot {
  height: 100%;
  position: relative;
}

.search-input input {
  font-size: 6em;
  font-weight: 700;
  padding: 0;
  max-height: unset;
  position: absolute;
  bottom: -12px;
  text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white;

}

</style>

<script>
import { VIcon, VTextField, VItemGroup, VBtn, VToolbar, VLayout, VFlex, VExpandTransition } from 'vuetify/lib'
import { debounce } from 'lodash'
import store from '@/store'

export default {
  name: 'SearchService',
  props: { },
  components: { VIcon, VTextField, VItemGroup, VBtn, VToolbar, VLayout, VFlex, VExpandTransition },
  computed: {
    status: function () {
      return store.state.search.status
    },
    results: function () {
      return store.state.search.results
    },
    navigation: function () {
      return store.state.search.navigation
    },
    query: function () {
      return store.state.search.query
    },
    multifile: function () {
      return store.state.search.multifile
    },
    regex_query: function () {
      return store.state.search.regex_query
    },
    case_sensitive: function () {
      return store.state.search.case_sensitive
    },
    state: function () {
      const { multifile, regex_query, case_sensitive } = this
      return [multifile, regex_query, case_sensitive]
    },
    debounce_update: function () {
      return debounce(this.update, 100)
    }
  },
  watch: {
    state: function () {
      this.debounce_update(this.query)
    }
  },
  methods: {
    update: async function (query) {
      const path = store.state.tome.path
      await store.dispatch('search/query', { path, query })
    },
    next: async () => await store.dispatch('search/next'),
    previous: async () => await store.dispatch('search/previous'),
    flag: async function (key, value) {
      await store.dispatch(`search/${key}`, value)
    },
    select: async function (path, target = 0, total = 0) {
      await store.dispatch('files/select', { path })

      if (target > 0) {
        await store.dispatch('search/navigate', { target, total })
      }

      store.dispatch('search/multifile', false)
    },
    debounce_clear: async function () {
      return await this.debounce_update('')
    }
  }
}

</script>
