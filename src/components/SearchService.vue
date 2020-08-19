<template>
  <div class="search-container">
    <div class="search-box">
      <v-text-field ref="input" large @input=update />
    </div>
  </div>
</template>

<style>
.search-container {
  position: absolute;
  width: 100%;
  bottom: 18px;
  z-index: 1000
}

.search-box {
  background: white;
  margin: 12px;
  padding: 12px;
  font-size: 4em;
  box-shadow: 3px 2px 6px 3px rgba(0, 0, 0, 0.2);
}
</style>

<script>
import store from '@/store'

export default {
  name: 'SearchService',
  props: { },
  methods: {
    update: query => store.dispatch('search/query', { query })
  }
}

</script>
