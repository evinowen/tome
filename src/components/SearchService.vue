<template>
  <div class="search-container">
    <v-toolbar class="search-box">
      <v-btn tile small :depressed=files @click="files = !files"><v-icon>mdi-file-multiple</v-icon></v-btn>
      <v-text-field ref="input" class="search-input" @input=update rows=1 :messages=status clearable />
      <div class="search-navigate" v-if=navigate>
        <v-item-group multiple>
          <v-btn tile small @click=previous><v-icon>mdi-chevron-left</v-icon></v-btn>
          <v-btn tile small @click=next><v-icon>mdi-chevron-right</v-icon></v-btn>
        </v-item-group>
        <div><small>{{ navigate.target }} / {{ navigate.total }}</small></div>
      </div>
    </v-toolbar>
    <v-expand-transition>
      <div v-show=files>
        <div class="search-results" v-if=results>
          <div class="search-result" v-for="result in results" :key="result.ref" @click=select(result.ref)>
            {{ relative(result.ref) }}
            <div class="search-score">
              {{ Number(result.score).toFixed(3) }}
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
  z-index: 1000
}

.search-navigate {
  text-align: center;
}

.search-results {
  height: 120px;
  margin: 12px;
  overflow-x: hidden;
  overflow-y: scroll;
  background: rgba(255, 255, 255, 0.5);
  border-top: 1px dotted rgba(0, 0, 0, 0.2);
  box-shadow: 3px 2px 6px 3px rgba(0, 0, 0, 0.2);
}

.search-empty {
  height: 100px;
  margin: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-top: 1px dotted rgba(0, 0, 0, 0.2);
  box-shadow: 3px 2px 6px 3px rgba(0, 0, 0, 0.2);
  padding: 20px;
  font-size: 4em;
  text-align: center;
  color: rgba(0, 0, 0, 0.2);
}

.search-result {
  background: rgba(255, 255, 255, 0.3);
  padding: 2px 6px 1px;
  border-bottom: 1px dotted rgba(0, 0, 0, 0.2);
}

.search-result:hover {
  color: white;
  background: rgba(244, 40, 30, 0.95);
}

.search-score {
  float: right;
  width: 36px;
  border-radius: 6px;
  margin: 1px;
  font-size: 0.8em;
  text-align: center;
  font-weight: bold;
  background: rgba(244, 40, 30, 0.4);
  color: rgba(255, 255, 255, 0.8);
}

.search-result:hover .search-score {
  background: rgba(255, 255, 255, 0.9);
  color:  rgba(244, 40, 30, 0.8);
}

.search-box {
  background: white;
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
import store from '@/store'
import { remote } from 'electron'

export default {
  name: 'SearchService',
  props: { },
  data: () => ({
    files: false
  }),
  computed: {
    status: () => store.state.search?.status,
    results: () => store.state.search?.results,
    navigate: () => store.state.search?.navigate
  },
  methods: {
    update: query => store.dispatch('search/query', { query }),
    next: _ => store.dispatch('search/next'),
    previous: _ => store.dispatch('search/previous'),
    relative: function (path) {
      const _path = remote.require('path')

      return _path.relative(store.state.tome.path, path)
    },
    select: async function (path) {
      store.dispatch('files/select', { path })

      this.files = false
    }
  }
}

</script>
