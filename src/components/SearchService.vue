<template>
  <div class="search-container">
    <v-toolbar class="search-box">
      <v-btn small :depressed=files :color="files ? 'primary' : ''" @click="files = !files"><v-icon>mdi-file-multiple</v-icon></v-btn>
      <v-text-field ref="input" class="search-input" @input=update @keydown.enter=next @keydown.esc="$emit('close')" rows=1 :messages=status clearable />
      <div class="search-navigation" v-if=navigation>
        <v-item-group multiple>
          <v-btn tile small @click=previous :disabled=!query><v-icon>mdi-chevron-left</v-icon></v-btn>
          <v-btn tile small @click=next :disabled=!query><v-icon>mdi-chevron-right</v-icon></v-btn>
        </v-item-group>
        <div><small>{{ navigation.target }} / {{ navigation.total }}</small></div>
      </div>
    </v-toolbar>
    <v-expand-transition>
      <div v-show=files>
        <div class="search-results" v-if=results>
          <div v-for="result in results" :key="result.path.relative">
            <div
              class="search-file"
              @click="select(result.path.absolute, 1, result.matches.length)"
            >
              <v-icon>mdi-file</v-icon> {{ result.path.relative }}
            </div>
            <div
              v-for="(match, index) in result.matches" :key="match.index"
              class="search-result"
              @click="select(result.path.absolute, index + 1, result.matches.length)"
            >
              {{ match.line }}
            </div>
          </div>
        </div>
        <div class="search-empty" v-else>ಠ_ಠ</div>
      </div>
    </v-expand-transition>
  </div>
</template>

<style>
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
  padding: 1px 6px 1px 24px;
  font-size: 0.8em;
  border-bottom: 1px dotted rgba(0, 0, 0, 0.2);
}

.search-file:hover,
.search-result:hover {
  color: var(--v-primary-lighten5) !important;
  background: var(--v-primary-base) !important;
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
import { VIcon, VTextField, VItemGroup, VBtn, VToolbar, VExpandTransition } from 'vuetify/lib'
import store from '@/store'

export default {
  name: 'SearchService',
  props: { },
  components: { VIcon, VTextField, VItemGroup, VBtn, VToolbar, VExpandTransition },
  data: () => ({
    files: false
  }),
  computed: {
    status: () => store.state.search?.status,
    results: () => store.state.search?.results,
    navigation: () => store.state.search?.navigation,
    query: () => store.state.search?.query
  },
  methods: {
    update: async query => await store.dispatch('search/query', { path: store.state.tome.path, query }),
    next: async _ => await store.dispatch('search/next'),
    previous: async _ => await store.dispatch('search/previous'),
    select: async function (path, target = 0, total = 0) {
      await store.dispatch('files/select', { path })

      if (target > 0) {
        await store.dispatch('search/navigate', { target, total })
      }

      this.files = false
    }
  }
}

</script>
