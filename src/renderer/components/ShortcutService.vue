<template>
  <div>
    <div v-shortkey.once="['esc']" @shortkey=escape />
    <div v-shortkey.once="['ctrl', '`']" @shortkey="layer('console')" />
    <div v-shortkey.once="['ctrl', 'e']" @shortkey="layer('edit')" />
    <div v-shortkey.once="['ctrl', 's']" @shortkey="layer('commit')" />
    <div v-shortkey.once="['ctrl', 'shift', 's']" @shortkey="perform('quick-commit')" />
    <div v-shortkey.once="['ctrl', 'p']" @shortkey="layer('push')" />
    <div v-shortkey.once="['ctrl', 'f']" @shortkey="layer('search')" />
    <div v-shortkey.once="['ctrl', 'o']" @shortkey="select()" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import store from '@/store'

export default Vue.extend({
  computed: {
    system: function () {
      return store.state.system
    }
  },
  methods: {
    escape: async function () {
      const layers = [
        'settings',
        'console',
        'patch',
        'search',
        'branch',
        'push',
        'commit',
        'edit'
      ]

      for (const layer of layers) {
        if (this.system[layer]) {
          return await store.dispatch(`system/${layer}`, false)
        }
      }

      return await store.dispatch('system/settings', true)
    },
    layer: async function (layer) {
      return await store.dispatch(`system/${layer}`, !this.system[layer])
    },
    perform: async function (performance) {
      await store.dispatch('system/perform', performance)
    },
    select: async function () {
      await store.dispatch('library/select')
    }
  }
}

</script>
